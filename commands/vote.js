const Embed = require("../embed.js")
const Discord = require('discord.js')
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml")
    let lang = await yml("./lang.yml")

    if(config.Vote_Command === `false`) return;
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Vote_Required_Rank.toLowerCase());
    if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Vote_Required_Rank} role was not found, please create it.`))
    if(!message.member.roles.has(role.id)) return message.reply(lang.Insufficient_Permission_Message)
    const questions = ["What's the voting title?", "What is the message?"];
    let vote;
    let title;
    for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    message.channel.send(question);

    let ms = await message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000, errors: ['time'] });
    const msg = ms.array()[0] ;
    if(msg.content.toLowerCase() == "cancel") return message.channel.send(":x: **Canceled**");
    if(i == 0) title = msg.content;
    else vote = msg.content;
    }
    message.channel.bulkDelete(4);
    let sicon = bot.user.displayAvatarURL;
    let channel = message.guild.channels.find(c => c.name.toLowerCase() == config.Vote_Channel.toLowerCase());
    if(!channel) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Vote_Channel} role was not found, please create it.`))
    let embed = new Discord.RichEmbed()
    .setColor(config.Theme_Color)
    .setThumbnail(sicon)
    .setAuthor(`${title}`)
    .setDescription(`${vote}`)
    .setTimestamp()
    channel.send(embed).then(async (msg) => {msg.react("✅").then(r => msg.react("❎"))})
	

    message.channel.send(`✅ ${message.author} Vote has been created!`)

}
module.exports.help = {
    name: "vote"
}
