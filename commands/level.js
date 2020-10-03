const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")
let xp = require("../data/experience.json");

module.exports.run = async (bot, message, args) => {
  const config = await yml("./config.yml");

  if (!xp[message.author.id]) {
    xp[message.author.id] = {
      xp: 0,
      level: 1
    };
  }
  let curxp = xp[message.author.id].xp;
  let curlvl = xp[message.author.id].level;
  let nxtLvlXp = curlvl * 5000;
  let difference = nxtLvlXp - curxp;
  let embed = new Discord.RichEmbed()
    .setAuthor(`${message.author.username}'s Level`)
    .setColor(config.Theme_Color)
    .setThumbnail("http://pixelartmaker.com/art/0fc29bffe9ca6e5.png")
    .addField("Level", curlvl, true)
    .addField("XP", curxp, true)
    .setFooter(`${difference} XP required to level up!`, message.author.displayAvatarURL);

  message.channel.send(embed);
}

module.exports.help = {
  name: "level"
}
