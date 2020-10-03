const Embed = require("../embed.js")
const Discord = require('discord.js');
const fs = require('fs');
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml")
    let lang = await yml("./lang.yml")
    if(config.Giveaway_System === `false`) return;
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Giveaway_ReRoll_Required_Rank.toLowerCase())
    if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Giveaway_ReRoll_Required_Rank} role was not found, please create it.`))
    let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
    if (!hasPermission) return message.reply(`${lang.Insufficient_Permission_Message}`);
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
        if (!giveaway.ended) return message.reply("That giveaway has not ended yet!");
        if (giveaway.reactions.length < 1) return message.reply("No one has entered the giveaway!");
        let winner = giveaway.reactions[~~(Math.random() * giveaway.reactions.length)];
        let embed = new Discord.RichEmbed()
            .setColor(config.Theme_Color)
            .setAuthor("Giveaway Winner")
            .setDescription("Congratulations to <@" + winner + "> for winning the " + giveaway.name)
            .addBlankField()
            .setFooter("Open a ticket to claim your prize")
            .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/154/party-popper_1f389.png");

        let channel = message.guild.channels.find(c => c.name.toLowerCase() == config.Giveaway_Channel.toLowerCase());
        if(!channel) return console.log(`ERROR! The ${config.Giveaway_Channel} channel was not found, please create it.`).then(message.channel.send(`Command failed. Check console for more info.`));
        channel.send(embed);
        channel.send("<@" + winner + "> ")
    })
}
module.exports.help = {
    name: "greroll"
}