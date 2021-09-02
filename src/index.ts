import { config } from "./config.js";
import * as _WebSocket from "ws";
import { getDefault } from "./getDefault.js";
import { open } from "fs/promises";

const WebSocket = getDefault(_WebSocket);

const logstream = await open('./chat.log', 'a');

let shutdown = false;
let disconnectCount = 0;

const interval1 = setInterval(() => {
	"use strict";
	if (disconnectCount > 0) disconnectCount--;
}, 60000);

function onOpen(event: {
	target: _WebSocket;
}) {
	"use strict";
	const ws = event.target;
	ws.send('CAP REQ :twitch.tv/membership');
	ws.send('CAP REQ :twitch.tv/tags');
	ws.send('CAP REQ :twitch.tv/commands');
	ws.send(`PASS ${config.twitch.oauth_password}`);
	ws.send(`NICK ${config.twitch.username}`);
	ws.send(`JOIN #${config.twitch.channel}`);
}

const lineSplitter = /\r?\n/g;

function parseTag(tag: string): [string, string] | string {
	"use strict";
	const [key, value] = tag.split('=');
	if (!value) return key;
	return [key, value];
}

function onMessage(event: {
	target: _WebSocket;
	data: string;
}) {
	"use strict";
	logstream.write(event.data);
	const messages = event.data.split(lineSplitter) as string[];
	messages.pop();
	const length = messages.length;
	for (let i = 0; i < length; i++) {
		const message = messages[i];
		if (message === 'PING :tmi.twitch.tv') {
			event.target.send('PONG :tmi.twitch.tv');
			continue;
		}
		const split = message.split(' ');
		let meta: (string | [string, string])[];
		if (split[0].startsWith('@')) {
			meta = split.shift()!.split(';').map(parseTag);
		} else meta = [];
		const [, command, ...args] = split;
		if (command === 'PRIVMSG') {
			const [channel, ...text] = args;
			if (channel !== `#${config.twitch.channel}`) continue;
			const meta_length = meta.length;
			let isMod = false;
			for (let j = 0; j < meta_length; j++) {
				const flag = meta[j];
				if (flag === 'mod') {
					isMod = true;
					break;
				} else if (flag[0] === 'mod') {
					isMod = flag[1] === '1';
					break;
				}
			}
			if (!isMod) continue;
			const userMessage = text.join(' ').slice(1);
			if (userMessage === '!killwatch') {
				const ws = event.target;
				shutdown = true;
				ws.send(`PRIVMSG ${channel} :*drain gurgles*`);
				ws.close();
			}
		}
	}
}

function onDisconnect() {
	"use strict";
	if (shutdown) {
		interval1.unref();
		clearInterval(interval1);
		return;
	}
	const timer = 2 ** disconnectCount;
	setTimeout(connect, timer * 1000);
}

function connect() {
	"use strict";
	const client = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

	client.addEventListener('open', onOpen);
	client.addEventListener('message', onMessage);
	client.addEventListener('close', onDisconnect);
}

connect();
