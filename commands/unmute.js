const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")
const fs = require('fs');
module.exports.run = async (bot, message, args) => {
  let config = await yml("./config.yml")
  let lang = await yml("./lang.yml")
  if(config.Unlock_Command === `false`) return;
  let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  let muterole = message.guild.roles.find(r => r.name.toLowerCase() == config.Mute_Role.toLowerCase());
  let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Unmute_Required_Rank.toLowerCase())
  let reason = args.slice(1).join(" ");
  if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Unmute_Required_Rank} role was not found, please create it.`))
  let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
  if (!hasPermission) return message.reply(lang.Insufficient_Permission_Message)
  if (!args[0]) return message.reply(`Usage: -unmute (user) (reason)`)
  if (!user) return message.reply(lang.No_User)
  if (!reason) return message.reply(lang.No_Reason)
  if (!muterole) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Mute_Role} role was not found, please create it.`))

  user.removeRole(muterole.id);
  message.channel.send(`<@${user.id}> has been unmuted by <@${message.author.id}> for ${reason}.`)
  fs.appendFile('punishmentlogs.txt', `[${new Date().toISOString()}] [G: ${message.guild.name} (${message.guild.id})] [C: ${message.channel.name} (${message.channel.id})] [A: ${message.author.tag} (${message.author.id})] [T: ${user.user.tag} (${user.id})] [TYPE: Unmute] ${reason}\n`, function (err) {
    if (err) throw err;
  });
}

module.exports.help = {
  name: "unmute"
}