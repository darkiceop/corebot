const Embed = require("../embed.js")
const Discord = require('discord.js');
const fs = require('fs');
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml")
    let lang = await yml("./lang.yml")
    if(config.Giveaway_System === `false`) return;
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Giveaway_Delete_Required_Rank.toLowerCase());
    if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Giveaway_Delete_Required_Rank} role was not found, please create it.`))
    let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
    if (!hasPermission) return message.reply(lang.Insufficient_Permission_Message);
    fs.readFile('./data/giveaways.json', 'utf-8', function (err, giveaways) {
        if (err) throw err;
        giveaways = JSON.parse(giveaways);
        let giveaway;
        if (!args[0]) giveaway = giveaways.sort((a, b) => b.start - a.start)[0];
        else {
            let g = giveaways.find(g => g.name.toLowerCase() == args.join(" ").toLowerCase());
            if (!g) return message.reply("No giveaway found with name ``" + args.join(" ") + "``");
            giveaway = g;
        }
        bot.guilds.get(giveaway.guild).channels.get(giveaway.channel).fetchMessage(giveaway.messageID).then(msg => msg.delete()).catch(err => { });
        giveaways.splice(giveaways.indexOf(giveaway), 1);
        message.channel.send(":white_check_mark: **Giveaway deleted**");
        fs.writeFile('./data/giveaways.json', JSON.stringify(giveaways), function (err) { if (err) console.log(err) })
    })
}
module.exports.help = {
    name: "gdelete"
}