const Embed = require("../embed.js")
const Discord = require("discord.js");
const ms = require("ms");
const yml = require(`../yml.js`)

module.exports.run = async (bot, message, args) => {
  const config = await yml("./config.yml")
  const lang = await yml("./lang.yml")

  if(config.Temp_Mute_Command === 'false') return;

  if(config.Remove_Command_Message === `true`) message.delete();

  let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= message.guild.roles.find(r => r.name.toLowerCase() == config.Announce_Required_Rank.toLowerCase()).calculatedPosition
    let role = message.guild.roles.find(r => r.name == config.Temp_Mute_Required_Rank)
    if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Temp_Mute_Required_Rank} role was not found, please create it.`))
    if(!hasPermission) return message.reply(lang.Insufficient_Permission_Message)
    if(!args[0]) return message.reply(`Usage: -tempmute (user) (reason) (length)`)
    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
    if(!user) return message.reply(lang.Tempmute_User_Undefined)
    if(user.roles.has(role.id)) return message.reply(lang.Tempmute_User_Staff)
    let muterole = message.guild.roles.find(r => r.name == config.Mute_Role);
    if(!muterole) message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Mute_Role} role was not found, please create it.`))
    if(!/\d+.+/.exec(args[1])) return message.reply(lang.Tempmute_Invalid_Mute_Time);
    let reason = args.slice(2).join(" ")
    if(!reason) return message.reply(lang.Tempmute_No_Reason)
  await(user.addRole(muterole.id));
  message.channel.send(`<@${user.id}> has been muted for ${ms(ms(mutetime))} for ${reason}`);
  setTimeout(function(){
  user.removeRole(muterole.id);
  message.channel.send(`<@${user.id}> has been unmuted.`);
  }, ms(mutetime));


}

module.exports.help = {
  name: "tempmute",
}
