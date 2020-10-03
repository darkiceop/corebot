const Embed = require("../embed.js")
const Discord = require("discord.js");
const yml = require("../yml.js");
const fs = require('fs');
module.exports.run = async (bot, message, args) => {
  let config = await yml("./config.yml")
  let lang = await yml("./lang.yml")

  if(config.Blacklist_Command === `false`) return;

   
  let role = message.guild.roles.find(r => r.name == config.Blacklist_Required_Rank)
  if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${Blacklist_Required_Rank} role was not found, please create it.`))
  let bMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
  if (!message.member.roles.has(message.guild.roles.find(r => r.name.toLowerCase() == config.Blacklist_Required_Rank.toLowerCase()).id)) return message.reply(lang.Insufficient_Permission_Message);
  if (!bMember) return message.reply(`${lang.No_User}`)
  if (bMember.roles.has(role.id)) return message.reply(`${lang.User_Is_Staff}`)
  if (bMember.id === bot.user.id) return message.reply(lang.User_Is_CoreBot)
  if (bMember.id === message.author.id) return message.reply(lang.User_Is_Yourself)
  if (!message.guild.roles.find(r => r.name.toLowerCase() == config.Blacklist_Role.toLowerCase())) message.guild.createRole({ name: config.Blacklist_Role })
  let aRole = message.guild.roles.find(r => r.name.toLowerCase() == config.Blacklist_Role.toLowerCase());
  if (!aRole) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${Blacklist_Role} role was not found, please create it.`))

  if (bMember.roles.has(aRole.id)) return message.reply("That user is already blacklisted!");
  await (bMember.addRole(aRole.id))

  message.channel.send(`${bMember} has been blacklisted!`)
  fs.appendFile('punishmentlogs.txt', `[${new Date().toISOString()}] [G: ${message.guild.name} (${message.guild.id})] [C: ${message.channel.name} (${message.channel.id})] [A: ${message.author.tag} (${message.author.id})] [T: ${bMember.user.tag} (${bMember.id})] [TYPE: Blacklist] ${args.slice(1).join(" ")}\n`, function (err) {
    if (err) throw err;
  });
}
module.exports.help = {
  name: "blacklist"
}