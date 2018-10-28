/**
 * s2d-migrator
 *
 * (c) 2018 ryosebach
 */
import {Channel, Client as DiscordClient, Guild, Message, TextChannel} from 'discord.js';

export default class Discord {
    static client: DiscordClient;

    static async init(token: string, readyFunc: () => Promise<void>, messageFunc: (mes: Message) => Promise<void>): Promise<void> {
        this.client = new DiscordClient();
        await this.client.login(token);
        if (!!readyFunc) {
            this.client.on('ready', async () => { readyFunc(); });
        }
        if (!!messageFunc) {
            this.client.on('message', async (mes: Message) => { messageFunc(mes); });
        }
    }

    static findChannelInGuild = async (channelName: string, guild: Guild): Promise<TextChannel> => {
        return guild.channels.find((channel: Channel) => (channel as TextChannel).name === channelName) as TextChannel;
    }

    static findGuild = async (guildName: string): Promise<Guild> => {
        return Discord.client.guilds.find((v: any) => v.name === guildName);
    }

    static findOrCreateChannelInGuild = async(channelName: string, guild: Guild): Promise<TextChannel> => {
        let discordChannel = await Discord.findChannelInGuild(channelName, guild);
        if (!discordChannel) {
            discordChannel = await guild.createChannel(channelName, 'text') as TextChannel;
        }
        return discordChannel;
    }
}
