const Embed = require("../embed.js")
const Discord = require("discord.js");
const yml = require("../yml.js");
const fs = require("fs");
const YAML = require('yaml');
const request = require("request-promise");
module.exports.run = async (bot, message, args) => {
    let cfg = await yml("./config.yml");
    let role = message.guild.roles.find(r => r.name.toLowerCase() == cfg.Bot_Update_Required_Rank.toLowerCase());
    if (!role) return message.channel.send("I could not find the ``" + cfg.Bot_Update_Required_Rank + "`` role in this server!");
    let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
    if (!hasPermission) return message.channel.send(lang.Insufficient_Permission_Message);
    let msg = await message.channel.send(":white_check_mark: Updating the bot. This should only take a moment.");
    const start = Date.now();
    request.post({
        url: 'https://corebot.dev/update',
        headers: {
            'key': cfg.Bot_Key
        }
    })
        .then(async res => {
            try {
                JSON.parse(res);
                message.channel.send("An error has occured. Read console for more information.");
                console.log("UPDATE ERROR:\n" + res);
            } catch {
                res = res.replace(/(\r)/g, '');
                let instructions = res.split("\n");
                let version = "";
                instructions.forEach((instruction, i) => {
                    if (i == 0) return version = instruction;
                    let array = instruction.split(":");
                    let key = array[0];
                    let value = array[1];
                    if (key.toLowerCase() == "editfile") {
                        let fetchingFile = value.split(" ")[1];
                        let file = value.split(" ")[0];
                        let obj = {
                            'key': cfg.Bot_Key,
                            'file': fetchingFile
                        }
                        const searchParams = Object.keys(obj).map((k) => {
                            return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
                        }).join('&');
                        request.post({
                            url: 'https://corebot.dev/updatefiles',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: searchParams
                        })
                            .then(r => {
                                try {
                                    JSON.parse(r);
                                    if (!(JSON.parse(r)).error) throw new Error("Not an Error");
                                    message.channel.send("An error has occured. Read console for more information.");
                                    console.log("UPDATE ERROR:\n" + r);
                                } catch {
                                    fs.writeFile("./" + file, r, function (err) { if (err) console.log(err) });
                                    console.log("File Updated: " + file);
                                }
                            })
                    } else if (key.toLowerCase() == "newfolder") {
                        fs.mkdir('./' + value, function (err) {
                            if (err) {
                                message.channel.send("An error has occured. Read console for more information.");
                                console.log("UPDATE ERROR:\n" + err);
                            } else {
                                console.log("Folder Created: " + value);
                            }
                        })
                    } else if (key.toLowerCase() == "editconfig" || key.toLowerCase() == "editlang") {
                        const editConfig = key.toLowerCase() == 'editconfig' ? true : false;
                        let fetchingFile = value;
                        let old = cfg;
                        delete old.BOT_VERSION;
                        let obj = {
                            'key': cfg.Bot_Key,
                            'file': fetchingFile
                        }
                        const searchParams = Object.keys(obj).map((k) => {
                            return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
                        }).join('&');
                        request.post({
                            url: 'https://corebot.dev/updatefiles',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: searchParams
                        })
                            .then(async r => {
                                try {
                                    JSON.parse(r);
                                    if (!(JSON.parse(r)).error) throw new Error("Not an Error");
                                    message.channel.send("An error has occured. Read console for more information.");
                                    console.log("UPDATE ERROR:\n" + r);
                                } catch {
                                    let newconfig = r;
                                    let text = "";
                                    const stringifiedConfig = YAML.stringify(newconfig);
                                    Object.keys(cfg).forEach(key => {
                                        stringifiedConfig[key] = cfg[key];
                                    })
                                    fs.writeFile(editConfig ? 'config.yml' : 'lang.yml', text.substring(0, text.length - 1), function (err) {
                                        if (err) {
                                            message.channel.send("An error has occured. Read console for more information.");
                                            console.log("UPDATE ERROR:\n" + r);
                                        } else {
                                            console.log((editConfig ? 'Config' : 'Language File') + " Updated");
                                        }
                                    })
                                }
                            })
                    }
                })
                let embed = new Discord.RichEmbed()
                    .setAuthor("Successfully Updated")
                    .setDescription(`Successfully updated CoreBot to version **${version}** *(${Date.now() - start}ms)*. **Restart your bot to apply updates.**`)
                    .setColor(cfg.Theme_Color);
                msg.edit(embed);
            }
        })
}
module.exports.help = {
    name: "botupdate"
}