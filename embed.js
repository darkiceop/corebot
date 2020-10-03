const { RichEmbed } = require('discord.js');
const yml = require('./yml.js');
let Theme_Color = parseInt("#fffff", 16);
let Error_Color = parseInt("#f52c2c", 16);
let Config = {};
let Language = {};
(async () => {
    const config = await yml('./config.yml');
    Config = config;
    Theme_Color = parseInt(config.Theme_Color.replace(/#/g, ''), 16);
    Error_Color = parseInt(config.Error_Color.replace(/#/g, ''), 16);
    Language = await yml("./lang.yml");
})()
module.exports = function (embedOptions) {
    if (embedOptions.preset) {
        switch (embedOptions.preset) {
            case 'nopermission':
                return {
                    embed: {
                        color: Error_Color,
                        title: "**No Permission**",
                        description: Language.Insufficient_Permission_Message,
                        timestamp: new Date()
                    }
                }
            case 'invalidargs':
                return {
                    embed: {
                        color: Error_Color,
                        title: "**Invalid Arguments**",
                        description: `Usage: \`\`${Config.Bot_Prefix}${embedOptions.usage}\`\``,
                        timestamp: new Date()
                    }
                }
            case 'errorinfo':
                return {
                    embed: {
                        color: Error_Color,
                        title: 'Error',
                        description: `${embedOptions.usage}`
                    }
                }
            default:
                return {
                    embed: {
                        color: Theme_Color,
                        title: "Error",
                        description: "An error has occured."
                    }
                }
        }
    } else {
        const embed = embedOptions;
        if (embed.color) embed.color = parseInt(embed.color.replace(/#/g, ''), 16);
        else embed.color = Theme_Color;
        if (embed.footer) {
            const footer = embed.footer;
            if (typeof footer == "string")
                embed.footer = { text: footer };

        }
        if (embed.author) {
            const author = embed.author;
            if (typeof author == "string")
                embed.author = { name: author };
        }
        if (embed.thumbnail)
            embed.thumbnail = { url: embed.thumbnail };
        return { embed: embed };
    }

}