const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
  let config = await yml("./config.yml")
  let lang = await yml("./lang.yml")

  if(config.IP_Command === `false`) return;

  let embed = new Discord.RichEmbed()
  .setColor(`${config.Theme_Color}`)
  .setTitle(`${config.IP_Embed_Header}`)
  .setDescription(`${config.Server_IP}`)

  message.channel.send(embed);
};

module.exports.help = {
  name: "ip"
};
