const Embed = require("../embed.js")
const Discord = require("discord.js");
let yml = require("../yml.js")
module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    message.delete();
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Rolemenu_Required_Rank.toLowerCase());
    if (!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Rolemenu_Required_Rank} role was not found, please create it.`))
    let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
    if (!hasPermission) return message.channel.send(lang.Insufficient_Permission_Message);
    if (args.length == 0) return message.channel.send(Embed({ preset: 'invalidargs', usage: 'rolemenu <menu>' }));
    const menu = config.Role_Menu_Roles[args[0]];
    if (!menu) return message.channel.send(Embed({ title: "**Invalid Menu**", description: "That role menu does not exist. Rolemenu names are **case-sensitive**." }));
    const embed = new Discord.RichEmbed()
        .setColor(config.Theme_Color)
        .setTitle("Role Menu - " + args[0])
        .setDescription(Object.keys(menu).map((e, i) => `${e} **${Object.values(menu)[i]}**`));
    message.channel.send(embed).then(async msg => {
        Object.keys(menu).forEach(async (e, i) => {
            setTimeout(async function () {
                await msg.react(e);
            }, i * 600)
        })
    });
}

module.exports.help = {
    name: "rolemenu"
}
