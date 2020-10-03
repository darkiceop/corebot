const Embed = require("../embed.js")
let Discord = require('discord.js');
let yml = require('../yml.js');

module.exports.run = async (bot, message, args) => {
    const config = await yml('./config.yml');
    const lang = await yml('./lang.yml');

    if(config.Report_Command === `false`) return;
    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let channel = message.guild.channels.find(c => c.name == config.Reports_Channel);
    let reason = args.join(" ").slice(22);

    if(!args[0]) return message.reply(`Usage: -report (user) (reason)`);
    if(!user) return message.reply(`Usage: -report **(user)** (reason)`);
    if(!args[1]) return message.reply(`Usage: -report (user) **(reason)**`);
    if(user.id === bot.user.id) return message.reply(`You can not report me`);
    if(user.id === message.author.id) return message.reply(`You can not report yourself`);
    if(!channel) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Reports_Channel} channel was not found, please create it.`))

    let embed = new Discord.RichEmbed()
    .setTitle('**REPORT**')
    .setColor(config.Theme_Color)
    .addField("Reported User", `${user}`, true)
    .addField("Reported By", `<@${message.author.id}>`, true)
    .addField("Reason", reason, true)

    channel.send(embed).then(await message.channel.send(`✅ User successfully reported.`));
}

module.exports.help = {
    name: "report"
}