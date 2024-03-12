import { read } from 'fs';
import net from 'net';

const server = net.createServer((socket) => {
	let buffer = '';
	socket.on('data', () => {
		buffer += chunk.toString();

		if (buffer.length > 4096) {
			console.log('this is possibly an attack, disconnecting...');
			socket.end();
			return;
		}

		try {
			//TODO:
		} catch (error) {
			console.error(error);
		}
	});
});
