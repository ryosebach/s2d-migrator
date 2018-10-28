/**
 * s2d-migrator
 *
 * 2018 ryosebach
 */
import { WebClient } from '@slack/client';

export default class Slack {
    static client: WebClient;

    static async init(token: string): Promise<void> {
        this.client = new WebClient(token);
    }
}
