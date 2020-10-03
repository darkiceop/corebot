const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")
const fs = require('fs');
module.exports.run = async (bot, message, args) => {
  const config = await yml("./config.yml");
  const lang = await yml("./lang.yml");
  if(config.Unban_Command === 'false') return;
  if(config.Remove_Command_Message === `true`) message.delete();
  let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Unban_Required_Rank.toLowerCase())
  let user = args[0]
  let reason = args.slice(1).join(" ")

  if (!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${Unban_Required_Rank} role was not found, please create it.`))
  let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
  if (!hasPermission) return message.reply(`${lang.Insufficient_Permission_Message}`)
  if (!args[0]) return message.reply(`Usage: -unban (user ID) (reason)`)
  if (!user) return message.reply(lang.No_User)
  if (user.id === message.author.id) return message.reply(lang.User_Is_Yourself);
  if (user.id === bot.user.id) return message.reply(lang.User_Is_CoreBot)
  if (!reason) return message.reply(lang.No_Reason)

  message.guild.unban(user, reason);
  message.channel.send(`${user} has been unbanned by ${message.author} for ${reason}!`)
  fs.appendFile('punishmentlogs.txt', `[${new Date().toISOString()}] [G: ${message.guild.name} (${message.guild.id})] [C: ${message.channel.name} (${message.channel.id})] [A: ${message.author.tag} (${message.author.id})] [T: ${user}] [TYPE: Unban] ${reason}\n`, function (err) {
    if (err) throw err;
  });
}

module.exports.help = {
  name: "unban"
}