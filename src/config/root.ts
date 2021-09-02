"use strict"; // strict mode, just in case.
import type { IDiscordConfig } from "./discord.js";
import { DiscordConfig } from "./discord.js";
import type { ITwitchConfig } from "./twitch.js";
import { TwitchConfig } from "./twitch.js";

/**
 * A plain configuration object.
 */
export interface IConfig {

	/**
	 * Discord configuration options.
	 */
	discord: IDiscordConfig;

	/**
	 * Twitch configuration options.
	 */
	twitch: ITwitchConfig;

}

/**
 * The configuration class.
 */
export class Config implements IConfig {

	public discord: DiscordConfig;

	public twitch: TwitchConfig;

	/**
	 * Construct the configuration.
	 * @param config The config to prepare this object with.
	 */
	public constructor(config: IConfig) {
		"use strict"; // strict mode

		// destructure the configuration object
		const {
			discord,
			twitch,
		} = config;

		// type check the configuration values
		if (typeof discord !== "object" || discord === null) throw new TypeError("Discord Configuration was not an object");
		if (typeof twitch !== "object" || twitch === null) throw new TypeError("Twitch Configuration was not an object");

		// assign values to instance
		this.discord = new DiscordConfig(discord);
		this.twitch = new TwitchConfig(twitch);

	}

}
