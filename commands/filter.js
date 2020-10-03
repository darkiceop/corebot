const Embed = require("../embed.js")
const Discord = require("discord.js");
const fs = require("fs");
const yml = require("../yml.js")
let filter = require("../data/filter.json");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml")
    let lang = await yml("./lang.yml")

    if(config.Filter_System === `false`) return;


    let role = message.guild.roles.find(r => r.name.toLowerCase() == "Admin".toLowerCase())
    if(!role && !message.member.hasPermission("ADMINISTRATOR")) return message.reply(lang.Insufficient_Permission_Message);
    if(role && !message.member.roles.has(role.id)) return message.reply(lang.Insufficient_Permission_Message);

    if(!args[0] || args[0].toLowerCase() == "help") return message.channel.send("**Filter Command**\n\n*-filter (subcommand) (option)*\n\n**filter list** - __shows the list of words in the filter__\n**filter add** - __add a word to the filter__\n**filter remove** - __remove a word from the filter__");

    if(args[0].toLowerCase() == "list"){
        let embed = new Discord.RichEmbed()
        .setAuthor("Filtered Words")
        .setColor(config.Theme_Color)
        .setTimestamp()
        .setThumbnail(bot.user.avatarURL)
        .setFooter("Blacklisted Words")
        .setDescription(filter.join("\n").length == 0 ? "None" : filter.join("\n"));
        message.channel.send(embed);
    }

    else if(args[0].toLowerCase() == "add"){
        if(!args[1]) return message.reply("Please provide a word to add to the filter!");
        for(let i = 0; i < filter.length; i++) if(filter[i].toLowerCase() == args[1].toLowerCase) return message.reply("That word is already in the filter!");

        filter.push(args[1]);
        message.channel.send("``" + args[1] + "`` has been added to the filter!");
        fs.writeFile("./filter.json", JSON.stringify(filter), function(err){
            if(err) console.log(err);
        })
    }

    else if(args[0].toLowerCase() == "remove"){
        if(!args[1]) return message.reply("Please provide a word to remove from filter!");
        for(let i = 0; i < filter.length; i++) if(filter[i].toLowerCase() == args[1].toLowerCase()) var found = true;
        if(!found) return message.reply("That word is not in the filter!");

        for(let i = 0; i < filter.length; i++) if(filter[i].toLowerCase() == args[1].toLowerCase()) filter[i] = "";
        message.channel.send("``" + args[1] + "`` has been removed from the filter!");
        fs.writeFile("./filter.json", JSON.stringify(filter), function(err){
            if(err) console.log(err);
        })
    }

    else return message.reply("Use **-filter help** to see a list of subcommands!")
}

module.exports.help = {
    name: "filter"
}