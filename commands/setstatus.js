const Embed = require("../embed.js")
const Discord = require("discord.js");
let file = require("../data/status.json");
const fs = require("fs");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    const lang = await yml("./lang.yml")

    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Set_Status_Required_Rank.toLowerCase())
    if (!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Set_Status_Required_Rank} role was not found, please create it.`))
    let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
    if (!hasPermission) return message.reply(lang.Insufficient_Permission_Message)
    if (!args[0]) return message.reply(`Usage: -setstatus (type) (new status) )`)
    if (args[0].toUpperCase() !== "WATCHING" && args[0].toUpperCase() !== "PLAYING" && args[0].toUpperCase() !== "STREAMING" && args[0].toUpperCase() !== "LISTENING") return message.reply("Wrong status! Use `playing`, `watching`, `streaming`, or `listening`");
    if (!args[1]) return message.reply("Please provide what you would like to change my status to.")
    bot.user.setActivity(args.slice(1).join(" "), { type: args[0].toUpperCase() });
    file["activity"] = args.slice(1).join(" ");
    file["type"] = args[0].toUpperCase();
    fs.writeFile("./status.json", JSON.stringify(file), (err) => { if (err) console.log(err) })

    message.reply(`The bot status has been updated to **${args[0]} ${args[1]}**!`)
}

module.exports.help = {
    name: "setstatus"
}
