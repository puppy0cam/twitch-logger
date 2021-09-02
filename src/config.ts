"use strict"; // strict mode, just in case.
import { readFile } from "fs/promises";
import type { IConfig } from "./config/root.js";
import { Config } from "./config/root.js";

const content = await readFile("./config.json", "utf8");

const rawConfig: IConfig = JSON.parse(content);

export const config = new Config(rawConfig);
