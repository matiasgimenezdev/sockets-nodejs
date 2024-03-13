const net = require('net');

const server = net.createServer((socket) => {
	//? This is the buffer that is going to store the data that is coming from the client.
	let buffer = '';

	socket.on('data', (chunk) => {
		buffer += chunk.toString();
		try {
			const { messages, lastMessage } = read(buffer);
			buffer = lastMessage;

			messages.forEach((message) => {
				parse(message, socket);
			});
		} catch (err) {
			console.error(
				"Error while reading the buffer. It's possible that the data is not in the correct format. It is possible that the client is attempting to hack the server."
			);
			socket.end();
		}
	});

	socket.on('error', () => {});
});

server.on('error', (err) => {
	console.error(err);
});

server.listen(52030, () => {
	console.log('Server ready.');
});

function read(buffer) {
	let messages = buffer.split('|');
	//* We store the last message in the buffer, because it is possible that it is not complete.
	const lastMessage = messages.pop();

	messages = messages
		.map((message) => {
			try {
				message = JSON.parse(message);
			} catch (err) {
				message = false;
			}

			return message;
		})
		.filter((message) => message !== false);

	return { messages, lastMessage };
}

function write(socket, id, data, error) {
	try {
		data = JSON.stringify({ id, data, error });
		console.log(data);

		socket.write(data + '|');
	} catch (err) {
		console.error(data);
		console.error(err);
	}
}

function parse(message, socket) {
	const { type, params } = message.data;
	console.dir(message, { depth: null });

	if (!protocol.hasOwnProperty(type)) {
		console.error('That task does not exist in the protocol.');
		console.error(message);
		socket.end();
		return;
	}

	try {
		protocol[type](socket, message.id, params);
	} catch (err) {
		console.error(message);
		console.error(err);
	}
}

// --------------------------------------------------------

const protocol = {
	sum: function (socket, id, data) {
		setTimeout(function () {
			const error = Math.random() > 0.5;

			if (error) {
				write(
					socket,
					id,
					{ message: 'Error executing the task' },
					error
				);
			} else {
				const sum = data.reduce((_, n) => _ + n, 0);
				write(socket, id, { result: sum });
			}
		}, Math.random() * 1000);
	},
};

// --------------------------------------------------------
