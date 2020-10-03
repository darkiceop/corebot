const Embed = require("../embed.js")
const Discord = require("discord.js");
const yml = require("../yml.js");
const fs = require("fs");
const request = require("request-promise");
module.exports.run = async (bot, message, args) => {
    let cfg = await yml("./config.yml");
    let lang = await yml("./lang.yml")

    let role = message.guild.roles.find(r => r.name.toLowerCase() == cfg.Debug_Required_Rank.toLowerCase());
    if (!role) return message.channel.send("I could not find the ``" + cfg.Debug_Required_Rank + "`` role in this server!");
    let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
    if (!hasPermission) return message.channel.send(lang.Insufficient_Permission_Message);
    message.channel.send(":white_check_mark: Starting debug process, this should only take a moment.");
    fs.readdir("./", function (err, files) {
        if (err) return message.channel.send("Oops! Looks like an error occured while running the debug command: ``" + err + "``. Please report this error in a CoreBot Ticket.");
        fs.readdir("./commands", function (err, commands) {
            if (err) return message.channel.send("Oops! Looks like an error occured while running the debug command: ``" + err + "``. Please report this error in a CoreBot Ticket.");
            fs.readdir('./addons', function (err, addons) {
                if (err) addons = [];
                fs.readFile("./index.js", "utf-8", function (err, index) {
                    if (err) return message.channel.send("Oops! Looks like an error occured while running the debug command: ``" + err + "``. Please report this error in a CoreBot Ticket.");
                    fs.readFile("./config.yml", "utf-8", function (err, config) {
                        if (err) return message.channel.send("Oops! Looks like an error occured while running the debug command: ``" + err + "``. Please report this error in a CoreBot Ticket.");
                        files = files.filter(f => !fs.lstatSync(f).isDirectory());
                        commands = commands.filter(f => !fs.lstatSync("./commands/" + f).isDirectory());
                        let errors = require("../index.js").errors;
                        let modules = require("../package.json").dependencies;
                        let prefixesFile = require("../data/prefixes.json");
                        let statusFile = require("../data/status.json")
                        let coinsFile = require("../data/coinsystem.json");
                        let giveawaysFile = require("../data/giveaways.json");
                        let experienceFile = require("../data/experience.json");
                        let tickets = require("../data/tickets.json");
                        let servers = [];
                        bot.guilds.forEach(g => {
                            servers.push({
                                name: g.name,
                                owner: bot.users.get(g.ownerID).username,
                                roles: g.roles.map(r => { return { name: r.name, id: r.id, color: r.hexColor, position: r.calculatedPosition } }),
                                channels: g.channels.map(c => { return { name: c.name, id: c.id, type: c.type, parentID: c.parentID } }),
                                id: g.id,
                                memers: g.memberCount,
                                botRoles: g.member(bot.user.id).roles.map(r => r.id)
                            })
                        })
                        files.forEach((f, i) => files[i] = f.replace(/'/g, "''"));
                        commands.forEach((c, i) => commands[i] = c.replace(/'/g, "''"));
                        errors.forEach((e, i) => {
                            errors[i] = {
                                error: e.error.toString().replace(/'/g, "''"),
                                author: e.author.replace(/'/g, "''"),
                                message: e.message.replace(/'/g, "''"),
                                time: e.time
                            }
                        })
                        let debugObject = {
                            errors: JSON.stringify(errors),
                            index: index.replace(/'/g, "''"),
                            mainDir: JSON.stringify(files),
                            commands: JSON.stringify(commands),
                            modules: JSON.stringify(modules),
                            servers: JSON.stringify(servers),
                            config: config.replace(/'/g, "''"),
                            coinSystem: JSON.stringify(coinsFile).replace(/'/g, "''"),
                            experience: JSON.stringify(experienceFile).replace(/'/g, "''"),
                            giveaways: JSON.stringify(giveawaysFile).replace(/'/g, "''"),
                            prefixes: JSON.stringify(prefixesFile).replace(/'/g, "''"),
                            status: JSON.stringify(statusFile).replace(/'/g, "''"),
                            tickets: JSON.stringify(tickets).replace(/'/g, "''"),
                            version: process.version,
                            memoryUsage: process.memoryUsage(),
                            addons: JSON.stringify(addons),
                            os: process.platform,
                            creator: JSON.stringify({ name: message.author.username, id: message.author.id, tag: message.author.tag, server: message.guild.id, serverName: message.guild.name })
                        }
                        const searchParams = Object.keys(debugObject).map((key) => {
                            return encodeURIComponent(key) + '=' + encodeURIComponent(debugObject[key]);
                        }).join('&');
                        request.post({
                            url: 'https://debug.corebot.dev/upload',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: searchParams
                        })
                            .then(json => {
                                json = JSON.parse(json);
                                if (!json.key) return message.channel.send("No key was returned in the request for a debug report.")
                                let embed = new Discord.RichEmbed()
                                    .setColor(cfg.Theme_Color)
                                    .setAuthor("Debug Report")
                                    .setDescription("Here's your debug URL: https://debug.corebot.dev/" + json.key);
                                message.channel.send(embed);
                            })
                    })

                });
            })
        });
    });
}
module.exports.help = {
    name: "debug"
}