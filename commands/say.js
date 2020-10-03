const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
  const config = await yml("./config.yml");
  const lang = await yml("./lang.yml")

  message.delete();
  let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Say_Required_Rank.toLowerCase())
  if (!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Say_Required_Rank} role was not found, please create it.`))
  let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
  if (!hasPermission) return message.reply(lang.Insufficient_Permission_Message)

  let argument = args.join(" ");
  let embed = new Discord.RichEmbed()
    .setColor(config.Theme_Color)
    .setDescription(argument);

  if (!args[0]) return message.reply(lang.No_Message_To_Say);

  message.channel.send(embed);
}

module.exports.help = {
  name: "say"
}
