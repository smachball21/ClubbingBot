const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

const prefix = "c!";

client.on("ready", function(message) { 
	console.log("ClubbingBot ready !");
	
	async function asyncCall() {
	  const result = await streamnotification();
	  console.log(result);
	}
	
	asyncCall();
	
	
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
async function streamnotification(client, message) {
	i = 1;
	while (true) {
		console.log('test');
		await sleep(30000);
	}
}
client.login(config.BOT_TOKEN);