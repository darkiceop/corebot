const Embed = require("../embed.js")
const Discord = require('discord.js');
const request = require('request-promise');
const yml = require("../yml.js");
const fs = require('fs');
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml")
    let lang = await yml("./lang.yml")

    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(lang.Insufficient_Permission_Message)
    if (args.length == 0) {
        let embed = new Discord.RichEmbed()
            .setColor("#ef2009")
            .setAuthor("Error")
            .setDescription("You must provide a key!");
        return message.channel.send(embed);
    }
    request.post({
        url: 'https://corebot.dev/keys/get',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'key': args[0],
            'server': message.guild.id
        },
    })
        .then(json => {
            json = JSON.parse(json);
            if (!json.name) {
                let embed = new Discord.RichEmbed()
                    .setColor("#ef2009")
                    .setAuthor("Error")
                    .setDescription("An error has occured:\n" + json.error);
                return message.channel.send(embed);
            }
            if (!fs.existsSync("./addons")) fs.mkdir("./addons", function (err) { if (err) console.log(err) });
            fs.writeFile('./addons/' + json.name, json.file, function (err) { if (err) return console.log(err); });
            let embed = new Discord.RichEmbed()
                .setColor(config.Color)
                .setAuthor("Addon Installed")
                .setDescription("The ``" + json.name.split(".")[0] + "`` addon has been successfully installed!");
            return message.channel.send(embed);
        })
}
module.exports.help = {
    name: "key"
}