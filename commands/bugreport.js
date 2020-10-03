const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => { 
  const config = await yml("./config.yml");
  const lang = await yml("./lang.yml")

  if(config.Bug_Report_Command === `false`) return;

  let channel = message.guild.channels.find(c => c.name.toLowerCase() == config.Bug_Reports_Channel.toLowerCase());
  let embed = new Discord.RichEmbed()
  .setColor(config.Theme_Color)
    .setTitle(`**BUG REPORT**`)
    .setDescription(args.join(" "))
    .setFooter(`From: ${message.author.tag}`, message.author.displayAvatarURL)
    .setTimestamp()

  if(!args[0]) return message.reply(lang.No_Bug_Found).then(msg => {msg.delete(2000)});;
  if(!channel) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${Bug_Reports_Channel} channel was not found, please create it.`))

  channel.send(embed)
  message.reply(lang.Bug_Reported_Reply_Message)
}
module.exports.help = {
  name: "bugreport"
};
