const Embed = require("../embed.js")
let yml = require("../yml.js");
const fs = require("fs");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");
    let lang = await yml("./lang.yml")
    let prefixes = require("../data/prefixes.json");
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Set_Prefix_Required_Rank.toLowerCase());
    if (!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Set_Prefix_Required_Rank} role was not found, please create it.`))
    let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
    if (!hasPermission) {
        return message.channel.send(lang.Insufficient_Permission_Message);
    }
    if (args.length == 0) {
        return message.channel.send("You must provide a prefix.");
    }
    prefixes[message.guild.id].prefix = args[0];
    fs.writeFile("./prefixes.json", JSON.stringify(prefixes), function (err) { if (err) console.log(err) });
    message.channel.send("The prefix has been set to " + args[0]);
}
module.exports.help = {
    name: "setprefix"
}