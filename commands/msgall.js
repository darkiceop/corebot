const Embed = require("../embed.js")
const Discord = require('discord.js');
const yml = require('../yml.js')

module.exports.run = async (bot, message, args) => {
    const config = await yml('./config.yml')
    const lang = await yml('./lang.yml')

    if(config.Msg_All_Command == `false`) return;
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Msg_All_Required_Rank.toLowerCase())
    if (!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Msg_All_Required_Rank} role was not found, please create it.`))
    let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
    if(!hasPermission) return message.channel.send(Embed({preset: 'nopermission'}))
    if(!args[0]) return message.channel.send(Embed({preset: 'invalidargs', usage: 'msgall <users/tickets> <message>'}))
    if(args[0] == `users`) {
        if(!args[1]) return message.channel.send(Embed({preset: 'invalidargs', usage: 'msgall <users/tickets> <message>'}))
        // message.guild.members.forEach(m => {m.send(args.slice(1).join(' ')).catch(err => {})})
        let arguments = args.slice(1).join(' ');
        message.guild.members.forEach(u => u.send(arguments).catch(err => {}));
        message.channel.send(`Messages sent.`);
    }
    if(args[0].toLowerCase() == 'tickets') {
        if(args.length < 2) return message.channel.send(Embed({preset: 'invalidargs', usage: 'msgall <users/tickets> <message>'}))
        let channels = message.guild.channels.filter(c => /ticket-\d+/.exec(c.name.toLowerCase()));
        if(!channels) return message.channel.send(Embed({preset: 'errorinfo', usage: 'There are currently no ticket channels'}));
        channels.forEach(m => m.send(args.slice(1).join(' ')));
        message.channel.send(`Messages sent.`)
    }
    if(!args[0] == `users` || !args[0] == `tickets`) return message.channel.send(Embed({preset: 'invalidargs', usage: 'msgall <users/tickets> <message>'}))
}

module.exports.help = {
    name: "msgall"
}