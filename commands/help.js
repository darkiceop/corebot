const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")
module.exports.run = async (bot, message, args) => {
  const config = await yml("./config.yml");
  const lang = await yml("./lang.yml");
  const regularHelp = lang.Help_Command.Regular;
  const adminHelp = lang.Help_Command.Admin;
  message.channel.send(Embed({title: '**BOT COMMANDS**', thumbial: bot.user.displayAvatarURL, description: Object.values(regularHelp).map(h => `**${h.usage.replace(/\-/g, require("../data/prefixes.json")[message.guild.id].prefix)}** ${h.description}`).join("\n")}))
  if(config.Staff_Help_Menu == `true`) {
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Staff_Help_Menu_Required_Rank.toLowerCase())
    if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Staff_Help_Menu_Required_Rank} role was not found, please create it.`))
    if(!message.member.roles.has(role.id)) return message.channel.send(Embed({title: '**STAFF COMMANDS**', thumbnail: `${bot.user.displayAvatarURL}`, description: Object.values(adminHelp).map(h => `**${h.usage.replace(/\-/g, require("../data/prefixes.json")[message.guild.id].prefix)}** ${h.description}`).join("\n")}));
  }
}
module.exports.help = {
  name: "help"
}
