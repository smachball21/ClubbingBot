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
    const config = {
		url: 'https://api.twitch.tv/helix/users?login=juliabayonetta_',		
	    method: 'GET',
	    headers: {
			'Client-ID': clientid,
			'Authorization': 'Bearer '+ secret
	    }
    }

    let res = await axios(config)
	let broadcaster_id = res.data.data[0].id;
	
	console.log(broadcaster_id);
	
	let inlive = isInLive(client, clientid, secret, broadcaster_id);

	while (true) {
		
		await sleep(3000);
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
	
	console.log(res.data);
}


client.login(config.BOT_TOKEN);
