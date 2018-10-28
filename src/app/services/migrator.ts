/**
 * s2d-migrator
 *
 * (c) 2018 ryosebach
 */
import {Attachment, TextChannel} from 'discord.js';

import Slack from 'app/middlewares/slack';
import * as slackService from 'app/services/slack';
import ImageDownloader from 'app/utils/imageDownloader';

export const transferImage = async (mes: any, discordChannel: TextChannel): Promise<void> => {
    const info = await slackService.getPublicInfo(mes.files[0].id);
    const imageInfo = await slackService.getImagePublicInfo(info);
    const buffer = await ImageDownloader.fetchBuffer(imageInfo.imageUrl);
    const attachment = new Attachment(buffer, imageInfo.imageName);
    await discordChannel.send('', attachment);
};

export const sendMessages = async (res: any, discordChannel: TextChannel, slackChannel: any): Promise<void> => {
    for (const mes of res.messages.reverse()) {
        if (mes.text.match(/has joined the channel/)) { continue; }
        if (!!mes.files) {
            await transferImage(mes, discordChannel);
            continue;
        }
        if (mes.text === '') { continue; }
        if (mes.replies) {
            const replyMessages = await Slack.client.channels.replies({channel: slackChannel.id, thread_ts: mes.ts});
        }
        discordChannel.send(mes.text);
    }
};
