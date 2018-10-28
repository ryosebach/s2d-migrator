/**
 * s2d-migrator
 *
 * 2018 ryosebach
 */
import * as log4js from 'log4js';

import Config from 'app/config/config';
import Discord from 'app/middlewares/discord';
import Slack from 'app/middlewares/slack';

import * as migratorService from 'app/services/migrator';

const logger = log4js.getLogger('console');

(async () => {
    Config.init();
    await Discord.init(Config.DISCORD_TOKEN, null, null);
    await Slack.init(Config.SLACK_TOKEN);

    const res = await Slack.client.channels.list() as any;
    for (const slackChannel of res.channels) {
        logger.info(`------- Migrate channel : ${slackChannel.name}---------`);
        const guild = await Discord.findGuild(Config.GUILD_NAME);
        const discordChannel = await Discord.findOrCreateChannelInGuild(slackChannel.name, guild);

        let count = 0;
        const responses = [];
        responses.push(await Slack.client.conversations.history({channel: slackChannel.id}) as any);

        while (responses[count].has_more) {
            const response = await Slack.client.conversations.history({
                channel: slackChannel.id,
                cursor: responses[count].response_metadata.next_cursor});
            responses.push(response as any);
        }
        for (; count >= 0; count--) {
            await migratorService.sendMessages(responses[count], discordChannel, slackChannel);
        }
    }
})();
