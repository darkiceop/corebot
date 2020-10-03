const Embed = require("../embed.js")
const Discord = require("discord.js");
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
  let config = await yml("./config.yml")
  let lang = await yml("./lang.yml")

  if(config.Unlock_Command === `false`) return;

  let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Unlock_Required_Rank.toLowerCase());
  if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Unlock_Required_Rank} role was not found, please create it.`))
  let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
  if (!hasPermission) return message.reply(lang.Insufficient_Permission_Message);
  message.channel.overwritePermissions(message.guild.id, {
    SEND_MESSAGES: true
  })
  let member = message.guild.roles.find(r => r.name == config.Join_Role)

  if(member) {
    message.channel.overwritePermissions(member.id, {
    SEND_MESSAGES: true
  })}
  let lock = new Discord.RichEmbed()
  .setColor(`#fc1717`)
  .addField("Deactivated", "Lock Down Mode Disabled")
  if(config.Unlock_Commmand_Embed_Special_Color == `false`) {
    lock.setColor(config.Theme_Color)
  }   
  message.channel.send(lock);
}
exports.help = {
  name: "unlock",
};
