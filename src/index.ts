import { config } from "./config.js";
import * as _WebSocket from "ws";
import { getDefault } from "./getDefault.js";
import { open } from "fs/promises";
import { IWebhookEmbed } from "./config/discord.js";

const WebSocket = getDefault(_WebSocket);

const logstream = await open('./chat.log', 'a');

let shutdown = false;
let disconnectCount = 0;

const interval1Function = () => {
	"use strict";
	if (disconnectCount > 0) disconnectCount--;
};

let interval1 = setInterval(interval1Function, 60000);

let pendingEmbeds: IWebhookEmbed[] = [];

const interval2Function = () => {
	"use strict";
	const all = pendingEmbeds;
	if (all.length === 0) return;
	pendingEmbeds = [];
	const groups: IWebhookEmbed[][] = [];
	for (let i = 0; i < all.length; i++) {
		const index = Math.floor(i / 10);
		const group = groups[index] ?? (groups[index] = []);
		group.push(all[i]);
	}
	for (const embeds of groups) {
		config.discord.execute({
			embeds,
		}).catch(console.error);
	}
};

let interval2 = setInterval(interval2Function, 10000);

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
	config.discord.execute({
		content: 'Connected, and authenticating',
	}).catch(console.error);
}

const lineSplitter = /\r?\n/g;

function parseTag(tag: string): [string, string] | string {
	"use strict";
	const [key, value] = tag.split('=');
	if (!value) return key;
	return [key, value];
}

function toEmbed(meta: (string | [string, string])[], command: string, args: string[]): IWebhookEmbed | undefined {
	"use strict";
	if (command === 'PRIVMSG') {
		const [channel, ...text] = args;
		const msg = text.join(' ').slice(1);
		let displayName: string | undefined;
		let displayColor: number | undefined;
		let timestamp: string | undefined;
		for (const i of meta) {
			if (typeof i === 'string') {
			} else {
				const [key, value] = i;
				if (key === 'display-name') {
					displayName = value;
				}
				if (key === 'color') {
					const res = parseInt(value.slice(1), 16);
					if (isFinite(res)) displayColor = res;
				}
				if (key === 'tmi-sent-ts') {
					const time = Number(value);
					if (isFinite(time)) timestamp = new Date(time).toISOString();
				}
			}
		}
		return {
			author: displayName ? {
				name: displayName,
			} : void 0,
			color: displayColor,
			description: msg,
			title: 'New Message',
			timestamp,
		};
	}
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
		const embed = toEmbed(meta, command, args);
		if (embed) pendingEmbeds.push(embed);
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
	interval2Function();
	config.discord.execute({
		content: 'Disconnected',
	}).catch(console.error);
	if (shutdown) {
		interval1.unref();
		clearInterval(interval1);
		interval2.unref();
		clearInterval(interval2);
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
