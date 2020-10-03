const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
  const config = await yml("./config.yml");
  const lang = await yml("./lang.yml");

  if(config.Clear_Command === `false`) return;

  let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Clear_Required_Rank.toLowerCase());

  if (!role) return console.log(`ERROR! The ${config.Clear_Required_Rank} role was not found, please create it.`).then(message.channel.send(`Command failed. Check console for more info.`));
  let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
  if (!hasPermission) return message.reply(`${lang.Insufficient_Permission_Message}`)
  if (!args[0]) return message.reply(lang.No_Amount_Of_Messages_To_Clear)

  let EmbedVariable_Amount = lang.Cleared.replace(/{amount}/g, args[0])

  message.channel.bulkDelete(args[0]).then(() => {
    message.channel.send(EmbedVariable_Amount).then(msg => msg.delete(5000));
  });

}

module.exports.help = {
  name: "clear"
}