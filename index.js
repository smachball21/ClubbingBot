// NEEDED PACKAGES
const fs = require("fs");

// DISCORD IMPORTATION & CONFIG FILE
const Discord = require("discord.js");
const jsonfile = "./config.json"
const config = require(jsonfile);
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


//============================================== BOT READY =================================================\\
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
});
//============================================== BOT READY =================================================//


//============================================== COMMANDS LIST =================================================\\
// WHEN CLIENT TYPE COMMAND
client.on("message", function(message) { 
    if (message.author.bot) return;
	if (!message.member.roles.cache.find(r => r.name === "BOT ACCESS") ) return ;
	if (!message.content.startsWith(prefix)) return;	
	
	const commandBody = message.content.slice(prefix.length);
	const args = commandBody.split(' ');
	const command = args.shift().toLowerCase();
	
	// Basic Commands
	if (command === "ping") {
		ping(message);
	}
	
	if (command === "help") {
		
		if (! args[0])
		{
			help(client, message);
		}
		else if ( args[0] === "twitch") 
		{
			helpTwitch(client, message);
		}
		
	}
	
	// Live commands
	if (command === "twitch")
	{
		if (args[0] === "notification")
		{
			if (args[1])
			{
				if (args[1] === "addstreamer") 
				{
					addstreamer(client, message, args[2], config, jsonfile);
				}
				
				if (args[1] === "removestreamer")
				{
					removestreamer(client, message, args[2], config, jsonfile);
				}
				
				if (args[1] === "list")
				{
					liststreamers(client, message)
				}
			}
			else
			{
				message.reply("Please specify a type of notification between : `"+prefix+"twitch notification {addstreamer, removestreamer & list}`")
			}			
		}
		else if (args[0] === "msgmodel")
		{
			changeStreamMSG(client, message, config, jsonfile)
		}
	}
	
	if (command === "test") 
	{

		
	}
});  

//============================================== COMMANDS FUNCTION ============================================//        

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

function remove(arr, what) {
    var found = arr.indexOf(what);

    while (found !== -1) {
        arr.splice(found, 1);
        found = arr.indexOf(what);
    }
}

function writeToJSON(data, file)
{
	var dataStringify = JSON.stringify(data, null,4);
	
	fs.writeFile(file, dataStringify, 'utf-8', function (err) {
		if (err)
		{
			console.log("An error occured while writing JSON Object to File. function writeToJSON()");
			return false;		
		}
		
		return true;
	});
}


function wip(client, message)
{
	message.reply("This functionnality is work in progress. Please wait the new update or call MisterRaymAn21");
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
			{ name: prefix+'help {command}', value: 'Get help embed message' },
			{ name: prefix+'ping', value: 'Check bot presence', inline: false },
			{ name: '\u200B', value: '\u200B' },
			{ name: prefix+'whoislive', value: 'Check if one streamer of defined list is on live', inline: false },
			{ name: prefix+'twitch {commands}', value: 'twitch & bot manager', inline: false },
		)
		.setTimestamp()		
		
	message.reply(helpEmbed);
}

function helpTwitch(client, message)
{
	const helpEmbed = new Discord.MessageEmbed()
		.setColor('#6441a5')
		.setTitle("ClubbingBot Commands")
		.setDescription("List of twitch commands")
		.addFields(
			{ name: '\u200B', value: '\u200B' },
			{ name: prefix+'twitch notification {addstreamer, removestreamer, list}', value: 'Manage streamers notifications', inline: false },
			{ name: prefix+"msgmodel", value: "Change model of live notification", inline: false}
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
					remove(isLive, element.login);
				}			
			}
			else
			{
				if ( isLive.indexOf(element.login) === -1) {
					isLive.push(element.login)
					
					console.log(element.login+' is now living')
					sendMessage(client, 'twitch', tw_botchannel, element.login, element.display_name,inlive.data.data[0], element)
				}
			}
		});		
		
		await sleep(180000);
	}
}

async function addstreamer(client, message, streamername, config, filename)
{
	if (streamername)
	{
		// CHECK PRESENCE OF STREAMERNAME IN JSON FILE		
		if (checkJSONpresence(streamername) === false)
		{
			// CHECK PRESENCE OF STREAMER IN TWITCH
			const tw_presence = await checkTWITCHpresence(streamername, tw_clientid,tw_secret)
			if (tw_presence === true)
			{
				// ADD STREAMER IN CONFIG FILE
				config.STREAMERSLIVENOTIFICATION.push(streamername);
				writeToJSON(config, filename)
				
				// AJOUTER LE CONTROLE DES ERREURS
				message.reply("The streamer `"+streamername+"` has been added successfully !")
			}
			else
			{
				message.reply("The streamername `"+streamername+"` was not found in twitch. Make sure the streamer name is correct ! ");
			}			
		}
		else
		{
			message.reply("This streamer is already added. Please use `"+prefix+"twitch notification list` for see the streamers list");
		}
	}
	else
	{
		message.reply("Please specify a streamer name");
	}
}

function removestreamer(client, message, streamername, config, filename)
{	
	if (streamername)
	{
		// CHECK PRESENCE OF STREAMERNAME IN JSON FILE	
		if (checkJSONpresence(streamername) === true)
		{
			
			var dataArray = config.STREAMERSLIVENOTIFICATION
			remove(dataArray, streamername)
			
			if (Array.isArray(dataArray) && ! dataArray.length)
			{
				config.STREAMERSLIVENOTIFICATION = []
			}
			else 
			{
				config.STREAMERSLIVENOTIFICATION = dataArray
			}
			
			// AJOUTER LE CONTROLE DES ERREURS
			writeToJSON(config, filename)
			message.reply("The streamer `"+streamername+"` has been removed successfully !")
		}
		else
		{
			message.reply("The streamer name is not on the streamer list. Please use `"+prefix+"twitch notification list` for see the streamers list");
		}
	}
	else
	{
		message.reply("Please specify a streamer name");
	}
}

function liststreamers(client, message)
{
	let streamersMSG = "**List of users twitch notifications :**"
	streamer.forEach( (elm) => {
		streamersMSG += "\n "+elm+",";
	});
	
	
	streamersMSG += "\n\n If you want to add more streamers you can type : `"+prefix+"twitch notification addstreamer {streamername}`";
	streamersMSG += "\n If you want to remove one streamers you can type : `"+prefix+"twitch notification removestreamer {streamername}`";
	message.reply(streamersMSG);
}


function checkJSONpresence(streamername)
{
	if (streamer.indexOf(streamername) != -1 )
	{
		return true
	}
	else
	{
		return false
	}
}

async function checkTWITCHpresence(streamername, clientid, secret)
{
    const config = {
		url: 'https://api.twitch.tv/helix/users?login='+streamername,		
	    method: 'GET',
	    headers: {
			'Client-ID': clientid,
			'Authorization': 'Bearer '+ secret
	    }
    }	
	
	let res = await axios(config)
	
	if (Array.isArray(res.data.data) && res.data.data.length)
	{
		return true;
	}
	else
	{
		return false;
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


function changeStreamMSG(client, message, config, filename)
{
	let filter = m => m.author.id === message.author.id
	var curChannel = client.channels.cache.get(message.channel.id);
	curChannel.send("📑 -  Please write your message model for live notification (1st %s = Twitch display name, 2nd %s = Twitch login name) ").then( () => {
		message.channel.awaitMessages(filter, {
			max: 1,
			time: 30000,
			errors: ['time']
		}).then(message => {
			message = message.first()
			
			curChannel.send("Do you want to confirm your choice ?").then( (message2) => {

				message2.react('✅').then(() => message2.react('❌'));
			
				const filter = (reaction, user) => {
					return ['✅', '❌'].includes(reaction.emoji.name) && user.id !== message2.author.id;
				};
				
				message2.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
					const reaction = collected.first();
					if (reaction.emoji.name === '✅') {
						// AJOUTER LE CONTROLE DES ERREURS
						config.BOT_MESSAGEMODEL = message.content;
						writeToJSON(config, filename)
						
						curChannel.send('✅ - Notification model message has been updated successfully !');
						return true;
					} else {
						curChannel.send('❌ - You canceled all changes !');
						return false;
					}					
				});
			});	
		}).catch(collected => {
			message.reply('❌ - All changes has been canceled !');
		});
	});
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
