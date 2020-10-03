const Embed = require("../embed.js")
const Discord = require('discord.js')
const yml = require("../yml.js");
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");
    let lang = await yml("./lang.yml")

    if(config.Announce_Command === 'false') return;
    let role = message.guild.roles.find(r => r.name == config.Announce_Required_Rank);
    let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= message.guild.roles.find(r => r.name.toLowerCase() == config.Announce_Required_Rank.toLowerCase()).calculatedPosition
    if(!hasPermission) return message.reply(lang.Insufficient_Permission_Message)
    if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${Announce_Required_Rank} role was not found, please create it.`))
    const questions = ["What title do you want?", "What is the message?"];
    let title;
    let announcement;
    for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    message.channel.send(question);

    let ms = await message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 60000, errors: ['time'] });
    const msg = ms.array()[0] ;
    if(msg.content.toLowerCase() == "cancel") return message.channel.send(":x: **Canceled**");
    if(i == 0) title = msg.content;
    else announcement = msg.content;
    }
    message.channel.bulkDelete(4);

    let channel = message.guild.channels.find(r => r.name.toLowerCase() == config.Announcement_Channel.toLowerCase());
    if(!channel) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${Announcements_Channel} channel was not found, please create it.`));
    let EmbedVariable_BotPFP = config.Announcement_Embed_Thumbnail.replace(/{Bot_PFP}/g, bot.user.displayAvatarURL)
    let EmbedVariable_ExecutorPFP = EmbedVariable_BotPFP.replace(/{Executor_PFP}/g, message.author.displayAvatarURL)
    let embed = new Discord.RichEmbed()
    .setColor(config.Theme_Color)
    .setTitle(`${title}`)
    .setDescription(`${announcement}`)

    if(config.Announcement_Embed_Timestamp == `true`) {
        embed.setTimestamp()
    }

    if(config.Announcement_Embed_Thumbnail !== '-NONE') {
        embed.setThumbnail(EmbedVariable_ExecutorPFP)
    }

    if(config.Announcement_Auto_Tag === 'true') {
        channel.send(`@everyone`).then(msg => { msg.delete(100) });
    }

    if(config.Announcement_Embed_Footer !== `-NONE`) {
        embed.setFooter(config.Announcement_Embed_Footer)
        if(config.Announcement_Embed_Footer_Avater_Image == `true`) {
            embed.setFooter(config.Announcement_Embed_Footer, message.author.displayAvatarURL)
        }
    }

    channel.send(embed)

    message.channel.send(lang.Announcement_Sent.replace(/{user}/g, message.member))
}
module.exports.help = {
    name: "announce"
}
