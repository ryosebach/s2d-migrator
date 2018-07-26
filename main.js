require('dotenv').config();
const { WebClient } = require('@slack/client');
const Discord = require('discord.js');
const download = require('image-downloader')
const cheerio = require('cheerio-httpcli')
const fs = require('fs-extra')
const util = require('util')

const guildName = process.env.DISCORD_GUILD;
const token = process.env.SLACK_TOKEN;
const slackClient = new WebClient(token);
const discordClient = new Discord.Client();

const getImagePublicInfo = async(info) => {
	return new Promise(async resolve => {
		const imageData = await cheerio.fetch(info.file.permalink_public)
		resolve({imageUrl: imageData.$('img').attr('src'), imageName: info.file.name})
	})
}

const transferImage = async (mes, discordChannel) => {
	return new Promise(async (resolve, reject) => {
		if(!mes.text.match(/uploaded a file/)) {
			reject('dont have upload image')
		} else {
			const info = await slackClient.files.sharedPublicURL({file: mes.file.id})
						.catch(async () => await slackClient.files.info({file: mes.file.id}))
			const imageInfo = await getImagePublicInfo(info)
			await fs.ensureDir("./tmp/")
			await download.image({url: imageInfo.imageUrl, dest: "./tmp/"+imageInfo.imageName})
			const buffer = fs.readFileSync("./tmp/"+imageInfo.imageName)
			const attachment = new Discord.Attachment(buffer, imageInfo.imageName)
			const sendMes = await discordChannel.send('', attachment)
			resolve(sendMes)
		}
	})
}




const sendMessages = (res, discordChannel, slackChannel) => {
	return new Promise(async resolve => {
		for (const mes of res.messages.reverse()) {
			if(mes.text.match(/has joined the channel/)) continue;
			if(mes.text=="") continue;
			console.log(res)
			console.log(mes)
			if(mes.replies) {
				const replyMessages = console.logawait slackClient.channels.replies({channel: slackChannel.id, ts: mes.ts})
				migrateReplyMessages(replyMessages, discordChannel)
			} else {
				const sendMes = await transferImage(mes, discordChannel).catch(async () => await discordChannel.send(mes.text))
				const sendmes = await discordChannel.send({content: "aaaa", embed: {
					title: "hofe",
					color: 3447003,
					description: "A very simple Embed!"
				}}
			}
			)

		}
		resolve()
	})
}




slackClient.channels.list()
.then(async (res) => {
	await discordClient.login(process.env.DISCORD_TOKEN);
	for (const slackChannel of res.channels) {
		if(slackChannel.name != "test") continue;
		console.log("------- Migrate channel : " + slackChannel.name + " ---------");
		const guild = await discordClient.guilds.find(v => v.name == guildName)
		let discordChannel = guild.channels.find(v => v.name==slackChannel.name)
		if(!discordChannel) 
			discordChannel = await guild.createChannel(slackChannel.name, 'text')
		let count = 0;
		const responses = [];
		responses.push(await slackClient.conversations.history({channel: slackChannel.id}))

		while(responses[count].has_more) {
			responses.push(
				await slackClient.conversations.history(
					{channel: slackChannel.id, cursor: responses[count].response_metadata.next_cursor}))
		}
		for(;count >= 0;count--) {
			await sendMessages(responses[count], discordChannel, slackChannel)
		}
	}
	await fs.remove("./tmp/")
	discordClient.destroy()
})
.catch(console.error);
