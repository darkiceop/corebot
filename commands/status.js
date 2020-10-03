const Embed = require("../embed.js")
const Discord = require("discord.js");
const rp = require("request-promise");
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    const serverone = config.Server_One_Name;
    const urlone = config.Server_One_URL;
    const queryone = config.Server_One_Query_URL;
    const servers = [{ "name": `${serverone}`, "url": `${urlone}`, "queryURL": `${queryone}` },]
    if(config.Status_Command == `false`) return;

    message.channel.send("Loading server status...");
    if (args.length >= 1) {
        let players;
        let total;
        let found = false;
        for (let i = 0; i < servers.length; i++) {
            if (servers[i].name.toLowerCase() == args[0].toLowerCase()) {
                found = true;
                await rp(servers[i].queryURL).then((html) => {
                    const json = JSON.parse(html);
                    if (json.error) players = "Offline";
                    else {
                        total = json.Players
                        if (!json.Playerlist) players = "None"
                        else players = json.Playerlist.join("\n")
                    }
                })
            }
        }
        if (!found) return message.reply("That is not a valid server!")

        let embed = await new Discord.RichEmbed()
            .setColor(config.Theme_Color)
            .setDescription(`${servers.name} - ${args[0]}\n\n**Players Online:** \`\`${total}\`\`\n\n${players}`);

        await message.channel.send(embed);
    } else {
        let description = "";
        let rdesc = "**Server Status** \n\n"


        rp(`${urlone}`).then((html) => {
            const json = JSON.parse(html);
            // rdesc += "**Players Online:** ``" + json.players.online + "``\n\n";
        });

        for (let i = 0; i < servers.length; i++) {
            await rp(servers[i].url).then((html) => {
                const json = JSON.parse(html);
                if (json.error) description += `**${servers[i].name}: **\`\`Offline\`\``;
                else {
                    const playerCount = json.players.online;
                    description += `${servers[i].name}: \n\`\`${playerCount} player(s)\`\`\n`;
                }
            })
        }
        let embed = new Discord.RichEmbed()
            .setColor(config.Theme_Color)
            .setFooter("Player and Server Status", bot.user.avatarURL)
            .setDescription(`${rdesc}${description}`)
        message.channel.send(embed);
    }
}
module.exports.help = {
    name: "status"
}