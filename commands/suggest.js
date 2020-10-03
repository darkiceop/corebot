const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
  const config = await yml("./config.yml");
  const lang = await yml("./lang.yml");

  if(config.Suggest_Command === 'false') return;

  let channel = message.guild.channels.find(c => c.name.toLowerCase() == config.Suggestions_Channel.toLowerCase());
  if(!channel) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Suggest_Command} channel was not found, please create it.`))
  let embed = new Discord.RichEmbed()
    .setColor(config.Theme_Color)
    .setTitle(`**SUGGESTION** `)
    .setDescription(args.join(" "))
    .setFooter(`From: ${message.author.tag}`, message.author.displayAvatarURL)
    .setTimestamp()

  if (!args[0]) return message.reply(config.No_Suggestion_Found)

  channel.send(embed).then(async (msg) => { msg.react("✅").then(r => msg.react("❎")) });
  message.reply(lang.Suggestion_Made_Reply_Message)

}
module.exports.help = {
  name: "suggest"
}
