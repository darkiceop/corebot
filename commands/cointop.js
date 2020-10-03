const Embed = require("../embed.js")
const Discord = require("discord.js");
let coins = require("../data/coinsystem.json")
const yml = require("../yml.js");
let amountToSort = 10;
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");

    if(config.Coin_System === `false`) return;

    let result = [];

    for(let i in coins)
        result.push({
            coins: coins[i].coins,
            id: i
    });
    result.sort((a, b) => b.coins - a.coins);
    let leaderboard = "";
    for(let i = 0; i < amountToSort; i++){
        if(args.length > 0 && parseInt(args[0])) i = ((parseInt(args[0])-1)*10)+i;
        if(result[i]) {
            let member = message.guild.member(result[i].id);
            leaderboard += `**#${i+1}** \`\`${~~result[i].coins}\`\`- ${member ? `<@${member.id}>` : "``Unknown``"}\n`;
        }
    }
    let total = result.map(r => r.coins).reduce((acc, cv) => acc+cv);

    let CoinTopEmbedVariable_Page = config.Coin_Top_Embed_Title.replace(/{page}/g, args.length > 0 ? parseInt(args[0]) : 1);
    let CoinTopEmbedVariable_TotalCoins = CoinTopEmbedVariable_Page.replace(/{totalcoins}/g, ~~total);

    let CoinTopEmbedFooterVariable_Page = config.Coin_Top_Embed_Footer.replace(/{page}/g, args.length > 0 ? parseInt(args[0]) : 1);
    let CoinTopEmbedFooterVariable_TotalCoins = CoinTopEmbedFooterVariable_Page.replace(/{totalcoins}/g, ~~total);

    let embed = new Discord.RichEmbed()
    .setColor(config.Theme_Color)
    .setTitle(CoinTopEmbedVariable_TotalCoins)
    .setDescription(leaderboard)

    if(config.Coin_Top_Embed_Footer === `-NONE`) {
        message.channel.send(embed)
        return;
    }

    embed.setFooter(CoinTopEmbedFooterVariable_TotalCoins);

    message.channel.send(embed);
}
module.exports.help = {
    name: "cointop"
}
