/**
 * s2d-migrator
 *
 * (c) 2018 ryosebach
 */
import * as dotenv from 'dotenv';
import * as log4js from 'log4js';
import * as path from 'path';

import Utils from 'app/utils/util';

/**
 * Config
 */
export default class Config {
    static DISCORD_TOKEN: string;
    static SLACK_TOKEN: string;
    static GUILD_NAME: string;
    static ROOT_DIR: string;
    static init(): void {
        dotenv.config();
        this.ROOT_DIR = path.resolve(`${__dirname}/../../../..`);
        this.DISCORD_TOKEN = Utils.stringToDefault(process.env.DISCORD_TOKEN);
        this.SLACK_TOKEN = Utils.stringToDefault(process.env.SLACK_TOKEN);
        this.GUILD_NAME = Utils.stringToDefault(process.env.GUILD_NAME);
        log4js.configure({
            appenders: {
                console: {
                    type: 'console'
                }
            },
            categories: {
                default: {
                    appenders: [
                        'console'
                    ],
                    level: 'INFO'
                }
            }
        });
    }
}
