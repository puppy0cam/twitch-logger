"use strict";
import fetch from "node-fetch";

 // strict mode, just in case.

/**
 * A plain Discord configuration object.
 */
export interface IDiscordConfig {

	/**
	 * A webhook URL to post updates.
	 */
	webhook: string;

}

export type snowflake = string;
export interface IWebhookQueryStringParameters {
  wait?: boolean;
  thread_id?: snowflake;
}
export interface IWebhookRequestBase {
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  allowed_mentions?: IAllowedMentionsObject;
}
export interface IWebhookRequestContent extends IWebhookRequestBase {
  content: string;
  embeds?: IWebhookEmbed[];
}
export interface IWebhookRequestEmbeds extends IWebhookRequestBase {
  content?: string
  embeds: IWebhookEmbed[];
}
export type IWebhookRequest = IWebhookRequestContent | IWebhookRequestEmbeds;
export interface IAllowedMentionsObject {
  parse?: ('roles' | 'users' | 'everyone')[];
  roles?: snowflake[];
  users?: snowflake[];
}
export interface IWebhookEmbed {
  title?: string;
  description?: string;
  url?: string;
  /** ISO8601 timestamp */
  timestamp?: string;
  color?: number;
  footer?: IEmbedFooter;
  image?: IEmbedImage;
  thumbnail?: IEmbedThumbnail;
  video?: IEmbedVideo;
  provider?: IEmbedProvider;
  author?: IEmbedAuthor;
  fields?: IEmbedField[];
}
export interface IEmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}
export interface IEmbedImage {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}
export interface IEmbedThumbnail {
  url?: string;
  proxy_url?: string;
  height?: string;
  width?: string;
}
export interface IEmbedVideo {
  url?: string;
  proxy_url?: string;
  height?: string;
  width?: string;
}
export interface IEmbedProvider {
  name?: string;
  url?: string;
}
export interface IEmbedAuthor {
  name?: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}
export interface IEmbedField {
  name: string;
  value: string;
  inline?: boolean;
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

	public async execute(data: IWebhookRequest) {
		"use strict";
		const result = await fetch(this.webhook, {
			body: JSON.stringify(data),
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const body = await result.text();
		if (result.ok) return body;
		throw new Error(body || 'Failed execution');
	}

}
