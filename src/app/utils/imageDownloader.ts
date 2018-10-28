/**
 * s2d-migrator
 *
 * (c) ryosebach 2018
 */

import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';

import Config from 'app/config/config';

export default class ImageDownloader {
    static DOWNLOAD_DIR: string;
    static async init(): Promise<void> {
        this.DOWNLOAD_DIR = path.join(Config.ROOT_DIR, 'images');
        if (!fs.existsSync(this.DOWNLOAD_DIR)) {
            fs.mkdirSync(this.DOWNLOAD_DIR);
        }
    }
    /**
     * URLを受け取り、該当するファイルをダウンロードしてBufferを返す。
     * @param url ダウンロードするファイルのURL
     */
    static async fetchBuffer(url: string): Promise<Buffer> {
        const response = await fetch(url, {method: 'GET'});
        return response.buffer();
    }
    /**
     * URLを受け取り、該当するファイルをダウンロードして指定したパスに保存する。
     * @param url ダウンロードするファイルのURL
     * @param filename ファイル名
     */
    static async download(url: string, filename: string): Promise<void> {
        const response = await fetch(url, {method: 'GET'});
        await response.body.pipe(fs.createWriteStream(path.join(ImageDownloader.DOWNLOAD_DIR, filename)));
    }
}
