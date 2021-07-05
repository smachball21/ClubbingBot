# ClubbingBot

How to install :
 - Clone the project
 - Do `npm install`
 - Copy `config.json.example` to `config.json`
 - Start the bot using `node index.js` 

Configuration of config.json : 
 - "BOT_TOKEN" = Discord Bot secret token
 - "BOT_PREFIX" = Prefix for call a bot command
 - "TWITCH_CLIENTID" = Twitch clientID
 - "TWITCH_AUTHTORIZATION" = Twitch authorization key
 - "BOT_CHANNELTWITCHMESSAGES" = Discord ChannelID for get live notification
 - "BOT_MESSAGEMODEL" = Define model of message with %s for parsing data (2 args required)
 - "STREAMERSLIVENOTIFICATION" = Define streamer check for live notifications (username can be found on twitch url)

Commands :

** Basics Commands :**
 - c!help : Get commands list
 - c!ping : Get bot latency

** Stream Commands :**
 - c!whoislive : Check who is live in the defined list in config.json
 - c!twitch notification {addstreamer (work in progress), removestreamer (work in progress), list} : Add / Remove and list streamer active for notifications
