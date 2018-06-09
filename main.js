require('dotenv').config();
const { WebClient } = require('@slack/client');
const Discord = require('discord.js');
const download = require('image-downloader')
const cheerio = require('cheerio-httpcli')
const fs = require('fs')
const util = require('util')

const guildName = process.env.DISCORD_GUILD;
const token = process.env.SLACK_TOKEN;
const slackClient = new WebClient(token);
const discordClient = new Discord.Client();

const getImagePublicInfo = async(info) => {
	return new Promise(resolve => {
		const imageData = cheerio.fetchSync(info.file.permalink_public)
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




const sendMessages = (res, discordChannel) => {
	return new Promise(async resolve => {
		for (const mes of res.messages.reverse()) {
			if(mes.text.match(/has joined the channel/)) continue;
			if(mes.text=="") continue;
			const sendMes = await transferImage(mes, discordChannel).catch(async () => await discordChannel.send(mes.text))
		}
		resolve()
	})
}




slackClient.channels.list()
.then(async (res) => {
	await discordClient.login(process.env.DISCORD_TOKEN);
	for (const slackChannel of res.channels) {
		console.log("-------" + slackChannel.name + "---------");
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
			await sendMessages(responses[count], discordChannel)
		}
	}
	await fs.remove("./tmp/")
})
.catch(console.error);
