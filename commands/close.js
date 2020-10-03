const Embed = require("../embed.js")
const Discord = require("discord.js");
const tickets = require("../data/tickets.json");
const fs = require("fs");
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");
    let lang = await yml("./lang.yml")
    if(config.Ticket_System === `false`) return;
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Ticket_Support_Role.toLowerCase());
    let id = message.channel.name.split("-")[1];
    let find = tickets.find(t => t && t.id == id);
    let hasPermission = role ? message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition : undefined;
    if (role && !hasPermission && find.authorID !== message.author.id)
        return message.reply(lang.Insufficient_Permission_Message)
    if (!role) message.reply("``ERROR!`` I could not find the ``" + config.Ticket_Support_Role + "`` role in this guild, please contact an administrator!")
    if (!role && !message.member.hasPermission("ADMINISTRATOR"))
        return message.reply(lang.Insufficient_Permission_Message)
    let check = new RegExp("([a-z]|[A-Z])+[-]([0-9])+");
    let c = check.exec(message.channel.name);
    if (!c) return message.reply(lang.Not_In_Ticket);
    if (!find) return message.reply("``ERROR!`` I could not find that ticket in the database!");
    tickets.splice(tickets.indexOf(find), 1);
    message.channel.delete();
    let channel = message.guild.channels.find(ch => ch.name.toLowerCase() == config.Ticket_Logs_Channel.toLowerCase());
    let user = message.guild.member(find.authorID);
    if (channel) {
        let embed = new Discord.RichEmbed()
            .setThumbnail(bot.user.avatarURL)
            .setFooter("Ticket Logs")
            .setAuthor("Ticket Closed")
            .setColor(config.Theme_Color)
            .setDescription(`**Closed by:** ${message.author} **with ID:** ${message.author.id}\n**Creator:** ${user} **with ID:** ${find.authorID}\n**Ticket ID:** ${find.id}\n**Channel Name:** ${find.name}-${find.id}\n**Added Users:** ${find.addedUsers.join(",")}`);
        channel.send(embed);
    }
    fs.writeFile("./data/tickets.json", JSON.stringify(tickets), (err) => {
        if (err) console.log(err)
    })
}

module.exports.help = {
    name: "close"
}