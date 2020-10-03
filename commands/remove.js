const Embed = require("../embed.js")
const Discord = require("discord.js");
const tickets = require("../data/tickets.json");
const fs = require("fs")
const yml = require("../yml.js")
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");
    let lang = await yml("./lang.yml");
    if(config.Ticket_System === `false`) return;
    if (!args[0]) return message.reply("You must provide a user to remove from this ticket!");
    let member = message.mentions.users.first() || message.guild.members.find(m => m.user.username == args[0] || m.id == args[0]);
    if (!member) return message.reply("I could not find that user in this guild!");
    let check = new RegExp("([a-z]|[A-Z])+[-]([0-9])+");
    let c = check.exec(message.channel.name);
    if (!c) return message.reply(lang.Not_In_Ticket);

    let find;
    let id = message.channel.name.split("-")[1];
    for (let i = 0; i < tickets.length; i++) if (tickets[i]) if (tickets[i].id == id) find = tickets[i];
    if (!find) return message.reply("``ERROR!`` I could not find that ticket in the database!");
    let user = message.guild.member(find.authorID);
    if (!find.addedUsers.includes(member.id)) return message.reply("That user is not added to this ticket!")
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Ticket_Support_Role.toLowerCase());
    let hasPermission = role ? message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition : undefined;
    if (role && !hasPermission && user.id !== message.author.id)
        return message.reply(lang.Insufficient_Permission_Message)
    if (!role) message.reply("``ERROR!`` I could not find the" + config.Ticket_Support_Role + "role in this guild, please contact an administrator!")
    if (!role && !message.member.hasPermission("ADMINISTRATOR"))
        return message.reply(lang.Insufficient_Permission_Message)
    let found = false;
    found = tickets.find(t => t && !t.currentTicket && t.addedUsers.includes(member.id)) ? true : false;
    if (!found) return message.reply("That user is not added!");
    tickets.find(t => t && t.id == find.id).addedUsers.splice(tickets.indexOf(found), 1)
    message.channel.overwritePermissions(member.id, {
        VIEW_CHANNEL: false, SEND_MESSAGES: false, READ_MESSAGES: false, ADD_REACTIONS: false, READ_MESSAGE_HISTORY: false
    })
    message.reply("User ``" + member.tag + "`` has been removed from the users for this ticket!");
    fs.writeFile("./data/tickets.json", JSON.stringify(tickets), (err) => {
        if (err) console.log(err)
    })
    let channel = message.guild.channels.find(r => r.name.toLowerCase() == config.Ticket_Logs_Channel.toLowerCase());
    if (channel) {
        let embed = new Discord.RichEmbed()
            .setThumbnail(bot.user.avatarURL)
            .setColor(config.Theme_Color)
            .setAuthor("User Removed")
            .setFooter("Ticket Logs")
            .setDescription(`**Removed by:** ${message.author} **with ID:** ${message.author.id}\n**Creator:** ${user} **with ID:** ${find.authorID}\n**Ticket ID:** ${find.id}\n**Removed User:** ${member}\n**Channel Name** ${message.channel.name}`);
        channel.send(embed);
    }
}

module.exports.help = {
    name: "remove"
}
