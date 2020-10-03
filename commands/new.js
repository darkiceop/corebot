const Embed = require("../embed.js")
const Discord = require("discord.js");
const tickets = require("../data/tickets.json");
const fs = require("fs");
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml")
    let lang = await yml("./lang.yml")
    if(config.Ticket_System === `false`) return;
    let userLimit = config.User_Ticket_Limit;
    let amt = tickets.find(t => t && t.authorID == message.author.id);
    if (amt > userLimit) return message.reply("You can only have up to ``" + userLimit + "`` tickets at a time, you must close a ticket first to create a new one!");
    if(config.Ticket_Require_Reason == `true` && !args[0]) return message.reply(`Usage: -new (reason)`)
    let currentTicket = tickets[0].currentTicket;
    let zero = 4 - (currentTicket.toString().length);
    let zeroes = "0".repeat(zero);
    message.guild.createChannel(`ticket- ${zeroes}${currentTicket}`, "text").then(ch => {
        let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Ticket_Support_Role.toLowerCase());
        if (role)
            ch.overwritePermissions(role.id, {
                VIEW_CHANNEL: true, SEND_MESSAGES: true, READ_MESSAGES: true, ADD_REACTIONS: true, READ_MESSAGE_HISTORY: true
            })
        else ch.send("There is no role called ``" + config.Ticket_Support_Role + "`` in this guild, so staff will not have permission to talk in this channel, please contact an administrator!");
        ch.overwritePermissions(message.author.id, {
            VIEW_CHANNEL: true, SEND_MESSAGES: true, READ_MESSAGES: true, ADD_REACTIONS: true, READ_MESSAGE_HISTORY: true
        })
        ch.overwritePermissions(message.guild.id, {
            VIEW_CHANNEL: false, SEND_MESSAGES: false, READ_MESSAGES: false, ADD_REACTIONS: false, READ_MESSAGE_HISTORY: false
        })
        ch.overwritePermissions(bot.user.id, {
            VIEW_CHANNEL: true, SEND_MESSAGES: true, READ_MESSAGES: true, ADD_REACTIONS: false, READ_MESSAGE_HISTORY: false
        })
        let category = message.guild.channels.find(c => c.type == 'category' && c.name.toLowerCase() == config.Ticket_Category.toLowerCase());
        if (category)
            ch.setParent(category);
        if (config.Ticket_Topic !== "-NONE") {
            let VarUser = config.Ticket_Topic.replace(/{user}/g, `<@${message.author.id}>`);
            let VarReason;
            if(!args[0]) {
                VarReason = VarUser.replace(/{reason}/g, "N/A")
            }
            if(args[0]) {
                VarReason = VarUser.replace(/{reason}/g, args.join(" "));
            }
            let VarTime = VarReason.replace(/{time}/g, message.createdAt.toLocaleString());
            let VarID = VarTime.replace(/{id}/g, `${zeroes}${currentTicket}`);
            ch.setTopic(VarID)
        }
        let embed = new Discord.RichEmbed()
            .setColor(config.Theme_Color)
            .setDescription(`Your new ticket has been created in ${ch}!`);
        message.channel.send(embed);

        let EmbedVariable_User = config.Ticket_Embed_Description.replace(/{user}/g, message.member)
        let EmbedVariable_Reason = EmbedVariable_User.replace(/{reason}/g, args.join(" "))

        let embed2 = new Discord.RichEmbed()
            .setColor(config.Theme_Color)
            .setTitle(config.Ticket_Embed_Title)
            .setDescription(EmbedVariable_Reason)
            .setThumbnail(bot.user.avatarURL);

            if(config.Ticket_Embed_Timestamp == `true`) {
                embed2.setTimestamp()
            }
            if(!config.Ticket_Embed_Footer == `-NONE`) {
                embed.setFooter(config.Ticket_Embed_Footer)
            }

        let role2 = message.guild.roles.find(r => r.name.toLowerCase() == config.Ticket_Support_Role.toLowerCase());
        if (role2)
            ch.send(`${role2}`)
        ch.send(embed2)
        tickets.push({
            id: zeroes + currentTicket,
            authorID: message.author.id,
            reason: args.join(" "),
            name: "ticket",
            addedUsers: []
        })
        let channel = message.guild.channels.find(ch => ch.name == config.Ticket_Logs_Channel);
        if (channel) {
            let embed = new Discord.RichEmbed()
                .setColor(config.Theme_Color)
                .setThumbnail(bot.user.avatarURL)
                .setFooter("Ticket Logs")
                .setAuthor("Ticket Created")
                .setDescription(`**Creator:** ${message.author} **with ID:** ${message.author.id}\n**Ticket ID:** ${zeroes}${currentTicket}\n**Channel Name:** ${ch.name}`);
            channel.send(embed);
        }
        tickets[0].currentTicket++;
        fs.writeFile("./data/tickets.json", JSON.stringify(tickets), (err) => {
            if (err) console.log(err)
        })
    })
}

module.exports.help = {
    name: "new"
}
