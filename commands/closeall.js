const Embed = require("../embed.js")
const Discord = require("discord.js");
const tickets = require("../data/tickets.json");
const fs = require("fs");
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");
    let lang = await yml("./lang.yml")
    if(config.Ticket_System === `false`) return;
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Close_All_Role.toLowerCase());
    let hasPermission = role ? message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition : undefined;
    if(!hasPermission) return message.reply(lang.Insufficient_Permission_Message)
    if(!role) message.reply("``ERROR!`` I could not find the ``" + config.Close_All_Role + "`` role in this guild, please contact an administrator!")
    let questions = ["Are you sure you would like to close all tickets? (Yes/No)*"];
    for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    message.channel.send(question);

    let ms = await message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000, errors: ['time'] });
    const msg = ms.array()[0] ;
    if(msg.content.toLowerCase() == "no") return message.channel.send(":x: **Close all canceled.**");
    if(msg.content.toLowerCase() == `yes`) {
    message.channel.bulkDelete(2);
    message.channel.send(`Closing all tickets...`)
    let channels = message.guild.channels.filter(c => /ticket-\d+/.exec(c.name.toLowerCase()));
    channels.forEach(mt => {
    let id = mt.name.split("-")[1];
    let find = tickets.find(t => t && t.id == id);
    let check = new RegExp("([a-z]|[A-Z])+[-]([0-9])+");
    let c = check.exec(mt.name);
    if (!find) return mt.send("``ERROR!`` I could not find this ticket in the database!");
    tickets.splice(tickets.indexOf(find), 1);
    mt.delete();
    let logs = message.guild.channels.find(ch => ch.name.toLowerCase() == config.Ticket_Logs_Channel.toLowerCase());
    let user = message.guild.member(find.authorID);
    if(logs) {
        let embed = new Discord.RichEmbed()
            .setThumbnail(bot.user.avatarURL)
            .setFooter("Ticket Logs")
            .setAuthor("Ticket Closed")
            .setColor(config.Theme_Color)
            .setDescription(`**Closed by:** ${message.author} **with ID:** ${message.author.id}\n**Creator:** ${user} **with ID:** ${find.authorID}\n**Ticket ID:** ${find.id}\n**Channel Name:** ${find.name}-${find.id}\n**Added Users:** ${find.addedUsers.join(",")}`);
        logs.send(embed);
        }
        fs.writeFile("./data/tickets.json", JSON.stringify(tickets), (err) => {
            if (err) console.log(err)
            })
        })
    }
    message.channel.send(`:white_check_mark: All tickets have been closed!`)
}}

module.exports.help = {
    name: "closeall"
}
