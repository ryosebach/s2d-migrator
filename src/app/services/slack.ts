/**
 * s2d-migrator
 *
 * (c) 2018 ryosebach
 */
import * as cheerio_client from 'cheerio-httpcli';

import Slack from 'app/middlewares/slack';

/**
 * slackのinfoのpermalink_publicを用いて画像のurlとファイルネームを取得する
 * @param info slack_cientから受け取ったinfo
 * @returns imageUrlとimageName
 */
export const getImagePublicInfo = async (info: any): Promise<{imageUrl: string; imageName: string}> => {
        const imageData = await cheerio_client.fetch(info.file.permalink_public);
        return ({imageUrl: imageData.$('img').attr('src'), imageName: info.file.name});
};

/**
 * slackのuploadImageのpublic_url含むinfoを取得する
 */
export const getPublicInfo = async (fileId: string): Promise<any> => {
    return Slack.client.files.sharedPublicURL({file: fileId})
            .catch(async () => Slack.client.files.info({file: fileId}));
};
