# About

SlackからDiscordへと全メッセージを移行するツールになります。

# Installation

Node.js 8.0.0 or newer is required.

1. clone this repository
1. `npm install`
1. `cp .env.sample .env`
1. edit .env

## Editing `.env` file

### 1. Set SLACK_TOKEN that you will use as a source

See [official references](https://api.slack.com/custom-integrations/legacy-tokens)

### 2. Set DISCORD_TOKEN

Get Discord Token and set .env
![img](https://github.com/ryosebach/s2d-migrator/blob/doc/img/getDiscordToken.jpg?raw=true)

### 3. Set DISCORD_GUILD

Set discord guild name to migrate

# Using

`node main.js`
