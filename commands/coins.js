const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")
let coins = require("../data/coinsystem.json");

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    const lang = await yml("./lang.yml");

    if(config.Coin_System === `false`) return;

    if (!args[0]) return message.channel.send(lang.Your_Coins.replace(/{coins}/g, coins[message.author.id].coins));
    else {
        let user = message.mentions.users.first()
        let EmbedVar_User = lang.User_Coins.replace(/{user}/g, message.mentions.users.first());
        let coins2 = coins[user.id].coins;
        if (!coins) coins2 = 0;
        let EmbedVar_Coins = EmbedVar_User.replace(/{coins}/g, coins2)
        if (!user) return message.reply(`This user does not exist.`)
        message.channel.send(EmbedVar_Coins);
    }
};

module.exports.help = {
    name: "coins",
}
