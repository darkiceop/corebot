const Embed = require("../embed.js")
const Discord = require("discord.js");
const fs = require("fs");
const yml = require("../yml.js")


module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");

    message.delete();
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(config.No_Permission).then(msg => { msg.delete(2000) });

    await message.guild.createChannel("Administration", "category").then(async category => {
        await message.guild.createChannel("announcements", "text").then(async ch => { await ch.setParent(category) });
        await message.guild.createChannel("updates", "text").then(async ch => { await ch.setParent(category) })
        await message.guild.createChannel("welcome", "text").then(async ch => { await ch.setParent(category) })
    });

    await message.guild.createChannel("Main", "category").then(async category => {
        await message.guild.createChannel("main", "text").then(async ch => { await ch.setParent(category) });
        await message.guild.createChannel("bot-spam", "text").then(async ch => { await ch.setParent(category) })
        await message.guild.createChannel("suggestions", "text").then(async ch => { await ch.setParent(category) })
        await message.guild.createChannel("bug-reports", "text").then(async ch => { await ch.setParent(category) })
    });

    await message.guild.createChannel("Staff", "category").then(async category => {
        await message.guild.createChannel("logs", "text").then(async ch => { await ch.setParent(category) });
        await message.guild.createChannel("ticket-logs", "text").then(async ch => { await ch.setParent(category) })
        await message.guild.createChannel("staff-chat", "text").then(async ch => { await ch.setParent(category) })
    });



    await message.guild.createRole({
        name: "Admin",
        color: "#000000",
        permissions: []
    })
    await message.guild.createRole({
        name: "Mod",
        color: "#000000",
        permissions: []
    })
    await message.guild.createRole({
        name: "Helper",
        color: "#000000",
        permissions: []
    })
    await message.guild.createRole({
        name: "Staff",
        color: "#000000",
        permissions: []
    })
    await message.guild.createRole({
        name: "Blacklisted",
        color: "#000000",
        permissions: []
    })
    await message.guild.createRole({
        name: "Member",
        color: "#000000",
        permissions: []
    })

    let installchannel = message.guild.channels.find(c => c.name.toLowerCase() == "logs");
    let embed = new Discord.RichEmbed()
        .setColor("#1B55AA")
        .setThumbnail(bot.user.avatarURL)
        .setFooter("Corebot - Made By: Revive")
        .setAuthor("CoreBot Installtion Complete")
        .setDescription(`Thank you for installing corebot! \nThe following channels have been created \n \n**Administration** \n#announcements #updates #welcome \n**Main** \n#main #bot-spam #suggestions #bug-report \n**Staff** \n#staff-chat #logs #ticket-logs \n \nThe folling roles have been created\n Member Helper Mod Admin \n \n**Installed by** \n${message.author} \n \nAny issues please contact us on our discord.`);
    if (installchannel) installchannel.send(embed);
    fs.unlink("./commands/install.js", function (err) { if (err) console.log(err) });
}
module.exports.help = {
    name: "install"
}