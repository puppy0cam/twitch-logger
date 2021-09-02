"use strict"; // strict mode, just in case.

/**
 * A plain Discord configuration object.
 */
export interface IDiscordConfig {

	/**
	 * A webhook URL to post updates.
	 */
	webhook: string;

}

/**
 * The Discord configuration class.
 */
export class DiscordConfig implements IDiscordConfig {

	public webhook: string;

	/**
	 * Construct the Discord configuration.
	 * @param config The config to prepare this object with.
	 */
	public constructor(config: IDiscordConfig) {
		"use strict"; // strict mode

		// destructure the configuration object
		const {
			webhook,
		} = config;

		// type check the configuration values
		if (typeof webhook !== "string") throw new TypeError("Discord Webhook was not a string");

		// check the length of string values
		if (webhook.length === 0) throw new RangeError("Discord Webhook was an empty string");

		// assign values to instance
		this.webhook = webhook;

	}

}
