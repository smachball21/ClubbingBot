// DISCORD
const Discord = require("discord.js");
const Commando = require("discord.js-commando");
const config = require("./config.json");

const client = new Discord.Client();
const prefix = config.BOT_PREFIX;

// CALL API
const axios = require("axios");
const tw_clientid = config.TWITCH_CLIENTID;
const tw_secret = config.TWITCH_AUTHTORIZATION;
const tw_botchannel = config.BOT_CHANNELTWITCHMESSAGES
const tw_msgmodel = config.BOT_MESSAGEMODEL

// STREAMER Array
var streamer = ['clubbingmix', 'misterrayman21'];
var isLive = []


client.on("ready", function(message) { 
	console.log("ClubbingBot ready !");
	
	async function asyncCall(client, tw_clientid, tw_secret) {
	  const result = await streamnotification(client, tw_clientid, tw_secret);
	  console.log(result);
	}
	asyncCall(client, tw_clientid, tw_secret);
});

client.on("message", function(message) { 
    if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;	
	
	const commandBody = message.content.slice(prefix.length);
	const args = commandBody.split(' ');
	const command = args.shift().toLowerCase();
	
	// Commands
	if (command === "ping") {
		ping(message);
	}
	
});            

// Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}  


// Get status of the bot (latency and alive)
function ping(message) {
	const timeTaken = Date.now() - message.createdTimestamp;
	message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
}	

// Stream function
async function streamnotification(client, clientid, secret) {
	while (true) {
		let i = 0
		let apilink = "https://api.twitch.tv/helix/users";
		streamer.forEach(element => {
			i++;
			
			if (i === 1)
			{
				apilink += "?login="+element
			}
			else
			{
				apilink += "&login="+element
			}
		});
		
		const config = {
			url: apilink,		
			method: 'GET',
			headers: {
				'Client-ID': clientid,
				'Authorization': 'Bearer '+ secret
			}
		}

		let res = await axios(config)
		
		var array = res.data.data
		
		array.forEach( async element => {
			var inlive = await isInLive(client, clientid, secret, element.id);
		
			if (inlive.data.data && !inlive.data.data.length) {				
				if (! isLive.indexOf(element.login)) {
					console.log(element.login+' stop his live')
					isLive.pop(element.login)
				}			
			}
			else
			{
				if (isLive.indexOf(element.login)) {
					isLive.push(element.login)
					
					console.log(element.login+' is now living')
					sendMessage(client, 'twitch', tw_botchannel, element.login, element.display_name,inlive.data.data[0], element)
				}
			}
		});		
		
		await sleep(10000);
	}
}

// Get Broadcaster is in live
async function isInLive(client, clientid, secret, broadcaster_id) {
    const config = {
		url: 'https://api.twitch.tv/helix/streams?user_id='+broadcaster_id,		
	    method: 'GET',
	    headers: {
			'Client-ID': clientid,
			'Authorization': 'Bearer '+ secret
	    }
    }	
	
	let res = await axios(config)
	
	return res;
}


// Parse string
function parse(str) {
    var args = [].slice.call(arguments, 1),
        i = 0;

    return str.replace(/%s/g, () => args[i++]);
} 

function parsewidth(str) {
    var args = [].slice.call(arguments, 1),
        i = 0;

	return str.replace(/{width}/g, () => args[i++]);
} 
function parseheight(str) {
    var args = [].slice.call(arguments, 1),
        i = 0;

	return str.replace(/{height}/g, () => args[i++]);
} 


// Send Message
function sendMessage(client, type, channelID, twitchname = null, twitchdisplayname = null, streamelement = null, userelement = null , message = null)
{

	if (type = "twitch"){
		if (twitchdisplayname == null){ twitchdisplayname = twitchname};

		const twembed = new Discord.MessageEmbed()
			.setColor('#6441a5')
			.setTitle(streamelement.title)
			.setAuthor(twitchdisplayname, userelement.profile_image_url, 'https://twitch.tv/'+twitchname)
			.setURL('https://twitch.tv/'+twitchname)
			.setThumbnail(userelement.profile_image_url)
			.setDescription(twitchname+" est en live !")
			.addField('Playing', streamelement.game_name, true)
			.setImage(parsewidth(parseheight(streamelement.thumbnail_url, '1080'), '1920'))
			.setTimestamp()	
			
		client.channels.fetch(channelID).then(channel => {
			channel.send(parse(tw_msgmodel, twitchdisplayname ,twitchname), twembed);
		});
	}
}


client.login(config.BOT_TOKEN);
