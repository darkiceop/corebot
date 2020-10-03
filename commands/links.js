const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
  const config = await yml("./config.yml");

  if(config.Link_Command === 'false') return;

  let embed = new Discord.RichEmbed()
    .setColor(config.Theme_Color)
    .setTitle('**LINKS**')
    .setDescription('All links related to the server')

    if(config.Website_Link !== '-NONE') {
        embed.addField(`Website:`, `${config.Website_Link}`);
    };

    if(config.Store_Link !== '-NONE') {
        embed.addField(`Store:`, `${config.Store_Link}`);
    };

    if(config.Twitter_Link !== '-NONE') {
        embed.addField(`Twitter:`, `${config.Twitter_Link}`);
    };

    if(config.Website_Link === '-NONE' && config.Store_Link === '-NONE' && config.Twitter_Link === '-NONE') {
        embed.setDescription(`There are no links related to the server!`)
    }

  message.channel.send(embed)
}
module.exports.help = {
  name: "links"
}