const Embed = require("../embed.js")
const Discord = require("discord.js");
const tickets = require("../data/tickets.json");
const fs = require("fs");
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");
    let lang = await yml("./lang.yml")
    if(config.Ticket_System === `false`) return;
    if(!args[0]) return message.reply("You must provide a user to add to this ticket!");
    let member = message.mentions.users.first() || message.guild.members.get(args[0]);
    if(!member) return message.reply("I could not find that user in this guild!");
    if(member.id == message.author.id) return message.reply("You cannot add yourself!");
    let check = new RegExp("([a-z]|[A-Z])+[-]([0-9])+");
    let c = check.exec(message.channel.name);
    if(!c) return message.reply("You are not in a ticket channel!");
    let id = message.channel.name.split("-")[1];
    let find = tickets.find(t => t && t.id == id);
    if(!find) return message.reply("``ERROR!`` I could not find that ticket in the database!");
    let user = message.guild.member(find.authorID);
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Ticket_Support_Role.toLowerCase());
    if(role && !message.member.roles.has(role.id) && user.id !== message.author.id)
        return message.reply("You do not have permission for that command!")
    if(!role) message.reply("``ERROR!`` I could not find the ``" + config.Ticket_Support_Role + "`` role in this guild, please contact an administrator!")
    if(!role && !message.member.hasPermission("ADMINISTRATOR"))
        return message.reply("You do not have permission for that command!")
    if(find.addedUsers.includes(member.id)) return message.reply("That user is already added!")
    tickets.find(t => t && t.id == id).addedUsers.push(member.id);
    message.channel.overwritePermissions(member.id, {
        VIEW_CHANNEL: true, SEND_MESSAGES: true, READ_MESSAGES: true, ADD_REACTIONS: true, READ_MESSAGE_HISTORY: true
    })
    message.reply("User ``" + member.tag + "`` has been added to this ticket!");
    fs.writeFile("./data/tickets.json", JSON.stringify(tickets), (err) => {
        if(err) console.log(err)
    })
    let channel = message.guild.channels.find(ch => ch.name == "ticket-logs");
    if(channel) {
        let embed = new Discord.RichEmbed()
        .setThumbnail(bot.user.avatarURL)
        .setFooter("Ticket Logs")
        .setColor(config.Theme_Color)
        .setAuthor("User Added")
        .setDescription(`**Added by:** ${message.author} **with ID:** ${message.author.id}\n**Creator:** ${user} **with ID:** ${find.authorID}\n**Ticket ID:** ${find.id}\n**Added User:** ${member}\n**Channel Name** ${message.channel.name}`);
        channel.send(embed);
    }
    }

module.exports.help = {
    name: "add"
}
