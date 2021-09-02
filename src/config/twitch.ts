"use strict"; // strict mode, just in case.

/**
 * A plain Twitch configuration object.
 */
export interface ITwitchConfig {

	/**
	 * The channel to connect to.
	 */
	channel: string;

	/**
	 * The OAuth password used to login.
	 * Use [this website](https://twitchapps.com/tmi/) to generate one.
	 */
	oauth_password: string;

	/**
	 * The username to connect as.
	 */
	username: string;

}

/**
 * The Twitch configuration class.
 */
export class TwitchConfig implements ITwitchConfig {

	public channel: string;

	public oauth_password: string;

	public username: string;

	/**
	 * Construct the Twitch configuration.
	 * @param config The config to prepare this object with.
	 */
	public constructor(config: ITwitchConfig) {
		"use strict"; // strict mode

		// destructure the configuration object
		const {
			channel,
			oauth_password,
			username,
		} = config;

		// type check configuration values
		if (typeof channel !== "string") throw new TypeError("Twitch Channel was not a string");
		if (typeof oauth_password !== "string") throw new TypeError("Twitch Oauth_password was not a string");
		if (typeof username !== "string") throw new TypeError("Twitch Username was not a string");

		// check length of string values
		if (channel.length === 0) throw new RangeError("Twitch Channel was an empty string");
		if (oauth_password.length === 0) throw new RangeError("Twitch Oauth_password was an empty string");
		if (username.length === 0) throw new RangeError("Twitch Username was an empty string");

		// assign values to instance
		this.channel = channel;
		this.oauth_password = oauth_password;
		this.username = username;

	}

}
