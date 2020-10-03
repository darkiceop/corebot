const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
  const config = await yml("./config.yml");

  if(config.Coin_System == "false") return;
  if(config.Shop_System == `false`) return;
    let shopEmbed = new Discord.RichEmbed()
    .setAuthor(config.ShopEmbed_Header)
    .setColor(config.Theme_Color)
    .addField(`${config.ShopEmbed_Item1_SubTitle}`, `${config.ShopEmbed_Item1_Description}`)
    .addField(`${config.ShopEmbed_Item2_SubTitle}`, `${config.ShopEmbed_Item2_Description}`)
    .addField(`${config.ShopEmbed_Item3_SubTitle}`, `${config.ShopEmbed_Item3_Description}`)
    
    message.channel.send(shopEmbed);
};
module.exports.help = {
  name: "shop"
}
