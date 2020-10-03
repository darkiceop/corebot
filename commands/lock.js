const Embed = require("../embed.js")
const Discord = require("discord.js");
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
  let config = await yml("./config.yml")
  let lang = await yml("./lang.yml")
  if(config.Lock_Command === `false`) return;
  let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Lock_Required_Rank.toLowerCase());
  if (!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${Lock_Required_Rank} role was not found, please create it.`))
  let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
  if (!hasPermission) return message.reply(lang.Insufficient_Permission_Message)
  let member = message.guild.roles.find(r => r.name.toLowerCase() == config.Join_Role.toLowerCase())
  message.channel.overwritePermissions(message.guild.id, {
    SEND_MESSAGES: false
  })
  if(member) {
    message.channel.overwritePermissions(member.id, {
    SEND_MESSAGES: false
  })}
  let lock = new Discord.RichEmbed()
    .setColor("#31eb10")
    .addField("Activated", "Lock Down Mode Enabled")

  if(config.Lock_Commmand_Embed_Special_Color == `false`) {
    lock.setColor(config.Theme_Color)
  }
  message.channel.send(lock);
}


module.exports.help = {
  name: "lock"
}
