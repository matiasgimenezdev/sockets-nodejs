import { read } from 'fs';
import { createConnection } from 'net';
import { buffer } from 'stream/consumers';

const options = {
	host: localhost,
	port: 52030,
};

const socket = createConnection(options, () => {
	console.log('connected to server');

	//? buffer => a buffer is a variable that is acumulating the chunks of data that are coming from the other end. The buffer assures that we are not loosing any data.
	//? On every socket connection we will need to use a buffer to store the data that is coming from the other end. Also is necessary to use a separator
	//? to split the data. The separator is going to be a caracter or something that the protocol defines.
	const buffer = '';

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

	//? _MAIN_ is a function that is going to be called when the socket is connected to the server.
	_MAIN_(socket);
});

socket.on('end', () => {
	console.log('disconnected from server');
});

//? This function will split the buffer into the different messages that are coming from the server.
const read = () => {
	let responses = buffer.split('|');
	buffer.pop();

	//* Data serialization
	try {
		responses = response.map((response) => JSON.parse(response));
		responses.forEach((message) => {
			//* expected message structure => { id: 1, data: 'some data'}
			if (!_PROMISES_.hasOwnProperty(message.id)) {
				return;
			}

			if (message.error) {
				_PROMISES_[message.id].reject(message.data);
				delete _PROMISES_[message.id];
				return;
			}

			_PROMISES_[message.id].resolve(message.data);
			delete _PROMISES_[message.id];
		});
	} catch (error) {
		console.error(buffer);
		console.error(error);
	}
	return buffer;
};

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

//* When a message superates the buffer length, the message will need to be fragmented in different chunks on some way. This is known as fragmentation.
