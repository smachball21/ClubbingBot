// DISCORD IMPORTATION & CONFIG FILE
const Discord = require("discord.js");
const config = require("./config.json");
const client = new Discord.Client();
const prefix = config.BOT_PREFIX;

// TWITCH API COMMUNICATIONS & REQUIREMENT
const axios = require("axios");
const tw_clientid = config.TWITCH_CLIENTID;
const tw_secret = config.TWITCH_AUTHTORIZATION;
const tw_botchannel = config.BOT_CHANNELTWITCHMESSAGES
const tw_msgmodel = config.BOT_MESSAGEMODEL

// STREAMERS NOTIFICATION ARRAYS
var streamer = config.STREAMERSLIVENOTIFICATION;
var isLive = []

// WHEN DISCORD BOT IS READY
client.on("ready", function(message) { 
	console.log("ClubbingBot ready !");
	
	async function asyncCall(client, tw_clientid, tw_secret) {
	  const result = await streamnotification(client, tw_clientid, tw_secret);
	  console.log(result);
	}
	asyncCall(client, tw_clientid, tw_secret);
	
	client.user.setPresence({
		status: 'dnd',
		activity: {
		  name: "http://twitch.tv/clubbingmix",
		  type: "WATCHING"
		}
    });
	
	//client.user.setActivity('https://t.tv/clubbingmix');
});


// WHEN CLIENT TYPE COMMAND
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
	
	if (command === "whoislive"){
		whoislive(client, message);
	}
	
	if (command === "help") {
		help(client, message);
	}
	
});            

//===== BASE FUNCTION ====\\
// Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
//========================\\

//===== COMMANDS FUNCTION ====\\

// Get status of the bot (latency and alive)
function ping(message) {
	const timeTaken = Date.now() - message.createdTimestamp;
	message.reply(`Je suis la ! Ma latence est de ${timeTaken}ms.`);
}	

// Get list on live strealer
function whoislive(client, message) {
	if (isLive && !isLive.length) {
		message.reply("Personne ne live actuellement !");
	}
	else {
		message.reply(isLive + " sont entrain de live maintenant !");
	}
}

// Get all commands
function help(client, message) {
	const helpEmbed = new Discord.MessageEmbed()
		.setColor('#6441a5')
		.setTitle("ClubbingBot Commands")
		.setDescription("List of all commands")
		.addFields(
			{ name: '\u200B', value: '\u200B' },
			{ name: prefix+'help', value: 'Get help embed message' },
			{ name: prefix+'ping', value: 'Check bot presence', inline: false },
			{ name: prefix+'whoislive', value: 'Check if one streamer of defined list is on live', inline: false },
		)
		.setTimestamp()		
		
	message.reply(helpEmbed);
}

//--- TWITCH FUNCTION ---\\

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
		
		await sleep(180000);
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
//-------------------\\

// Send Message
function sendMessage(client, type, channelID = null , twitchname = null, twitchdisplayname = null, streamelement = null, userelement = null , message = null)
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
		
		return true;
	}
}


client.login(config.BOT_TOKEN);
