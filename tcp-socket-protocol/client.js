const net = require('net');

const options = {
	host: 'localhost',
	port: 52030,
};

const promises = {};

const socket = net.createConnection(options, () => {
	console.log('connected to server');

	//? buffer => a buffer is a variable that is acumulating the chunks of data that are coming from the other end. The buffer assures that we are not loosing any data.
	//? On every socket connection we will need to use a buffer to store the data that is coming from the other end. Also is necessary to use a separator
	//? to split the data. The separator is going to be a caracter or something that the protocol defines.
	//* Buffer initialization
	let buffer = '';

	socket.on('data', (chunk) => {
		buffer += chunk.toString();

		//* A buffer always has a maximum size, we need to be careful with the size of the buffer.
		//! This is for avoiding buffer overflow attacks.
		if (buffer.length > 2048) {
			console.log('this is possibly an attack, disconnecting...');
			socket.end();
			return;
		}

		buffer = read(buffer);
	});

	//* The socket is connected, so we can call the main function.
	main(socket);
});

socket.on('end', () => {
	console.log('disconnected from server');
});

//? This function will split the buffer into the different messages that are coming from the server.
const read = (buffer) => {
	const separator = '|';
	let responses = buffer.split(separator);
	//* The last element of the array is going to be an empty string, so we need to remove it.
	responses.pop();

	try {
		//* Data serialization
		responses = responses.map((message) => JSON.parse(message));
		responses.forEach((message) => {
			if (!promises.hasOwnProperty(message.id)) {
				return;
			}

			if (message.error) {
				promises[message.id].reject(message.data.message);
				delete promises[message.id];
				return;
			}

			//* We are going to resolve the promise with the data that is coming from the server. This will return the result to the main function.
			promises[message.id].resolve(message.data.result);
			delete promises[message.id];
		});
	} catch (error) {
		console.error(buffer);
		console.error(error);
	}
	return buffer;
};

//? This function will write the data to the server.
const write = (socket, id, data) => {
	let message = '';
	try {
		message = JSON.stringify({ id, data });
		socket.write(`${message}|`);
	} catch (error) {
		console.error(message);
		console.error(error);
	}
};

//? This function is going to be called when we want to send a task to the server.
async function task(socket, data) {
	const id = Date.now().toString();

	return new Promise((resolve, reject) => {
		//* We are going to store the resolve and reject functions in the promises object. So when the server sends the response we can resolve/reject the promise (task).
		promises[id] = { resolve, reject };
		write(socket, id, data);
	});
}

//? This is the main function that is going to be called once the socket is connected to the server.
async function main(socket) {
	try {
		const result = await task(socket, {
			type: 'sum',
			params: [4, 5],
		});
		console.log('Task result: ' + result);
	} catch (error) {
		console.error('Task execution failed: ' + error);
	}
}
