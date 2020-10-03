const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
  let config = await yml("./config.yml")
  let lang = await yml("./lang.yml")

  if(config.Update_Command === `false`) return;
  let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Update_Required_Rank.toLowerCase())
  let channel = message.guild.channels.find(c => c.name.toLowerCase() == config.Updates_Channel.toLowerCase())
  let argument = args.join(" ");
  let botEmbed = new Discord.RichEmbed()
    .setColor(config.Theme_Color)
    .setAuthor(`Updates`)
    .setDescription(argument)

  if (!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Update_Required_Rank} role was not found, please create it.`))
  let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
  if (!channel) message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Updates_Channel} channel was not found, please create it.`))
  if (!hasPermission) return message.reply(lang.Insufficient_Permission_Message).then(msg => { msg.delete(2000) });
  if (!args[0]) return message.reply(`Usage: -update (update)`).then(msg => { msg.delete(2000) });
  
  message.delete()
  channel.send(botEmbed)
  message.channel.send(`✅ <@${message.author.id}> Update sent!`)
}

module.exports.help = {
  name: "update"
}
