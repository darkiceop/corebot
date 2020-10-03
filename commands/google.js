const Embed = require("../embed.js")
const Discord = require('discord.js');
const yml = require('../yml.js')

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    const lang = await yml("./lang.yml");

    if(config.Google_Command == `false`) return;
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Google_Required_Rank.toLowerCase());
    if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Google_Required_Rank} role was not found, please create it.`));
    let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
    if(!hasPermission) return message.reply(lang.Insufficient_Permission_Message)
    if(args.length == 0) return message.channel.send('Usage: -google (message)');
    let embed = new Discord.RichEmbed()
    .setColor(config.Theme_Color)
    .setTitle(`**GOOGLE SEARCH**`)
    .addField("Searching Google for `" + args.join(' ') + "`...", `[Click Here](https://google.com/search?q=${args.join(' ').replace(/ /g, "%20")})`)

    message.channel.send(embed)
}

module.exports.help = {
    name: "google"
}