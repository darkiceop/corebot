const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")
const fs = require('fs');
module.exports.run = async (bot, message, args) => {
  let config = await yml("./config.yml")
  let lang = await yml("./lang.yml")
  if(config.Kick_Command === `false`) return;

  let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Kick_Required_Rank.toLowerCase());
  let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  let reason = args.join(" ").slice(22);

  if (!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Kick_Required_Rank} role was not found, please create it.`))
  let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
  if (!hasPermission) return message.reply(lang.Insufficient_Permission_Message )
  if (!args[0]) return message.reply(`Usage: -kick (user) (reason)`)
  if (!user) return message.reply(`${lang.No_User}`)
  if (user.id === message.author.id) return message.reply(lang.User_Is_Yourself)
  if (user.roles.has(role.id)) return message.reply(lang.User_Is_Staff)
  if (user.id === bot.user.id) return message.reply(lang.User_Is_CoreBot)
  if (!reason) return message.reply(lang.No_Reason)

  message.guild.member(user).kick(reason)
  message.channel.send(`${user} has been kicked by ${message.author} for ${reason}!`)
  fs.appendFile('punishmentlogs.txt', `[${new Date().toISOString()}] [G: ${message.guild.name} (${message.guild.id})] [C: ${message.channel.name} (${message.channel.id})] [A: ${message.author.tag} (${message.author.id})] [T: ${user.user.tag} (${user.id})] [TYPE: Kick] ${reason}\n`, function (err) {
    if (err) throw err;
  });
}

module.exports.help = {
  name: "kick"
}
