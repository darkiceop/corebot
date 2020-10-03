const Embed = require("../embed.js")
const Discord = require("discord.js");
const coins = require("../data/coinsystem.json");
const exp = require("../data/experience.json");
const fs = require("fs");
const yml = require("../yml.js");

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    const lang = await yml("./lang.yml");
    if(config.Take_Command == `false`) return;
    let usage = `take <@user/all> <coins/exp/role> <amount/role name>`
    if(config.Coin_System == `false`) {
        usage = `take <@user/all> <exp/role> <amount/role name>`
    }
    if(config.Level_System == `false`) {
        usage = `take <@user/all> <coins/role> <amount/role name>`
    }
    if(config.Coin_System == `false` && config.Level_System == `false`) {
        usage = `take <@user/all> <role> <role name>`
    }
    const role = message.guild.roles.find(r => r.name.toLowerCase() == config.Take_Required_Rank.toLowerCase())
    const hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
    if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Take_Required_Rank} role was not found, please create it.`))
    if(!hasPermission) return message.channel.send(Embed({preset: 'nopermission'}));
    if(!args[0]) return message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`}));

    if(args[0] == `all`) {
        if(!args[1] == `role` || !args[1] == `coins` || !args[1] == `exp`) return message.channel.send(Embed({preset: 'errorinfo', usage: `Valid options: coins, exp, role`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
        if(args[1] == `role`) {
            if(!args[2]) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a role to remove`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            let toRemove = message.guild.roles.find(r => r.name.toLowerCase() == args[2].toLowerCase());
            if(!toRemove) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid role to remove`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            if(toRemove.calculatedPosition >= message.guild.members.find(m => m.id == bot.user.id).highestRole.calculatedPosition) return message.channel.send(Embed({preset: 'errorinfo', usage: `I do not have the necessary permissions to add the **<@&${toRemove.id}>** role to a user`}));
            message.channel.send(`*Removing roles from all users. This may take some time...*`)
            message.guild.members.forEach(u => {
                u.removeRole(toRemove)
            })
            await message.channel.send(Embed({description: `The **<@&${toRemove.id}>** role has been removed from **ALL USERS**`, title: '**ROLES REMOVED**'})).then(
                console.log(`The ${args[2]} role has been removed from all users - Action performed by: ${message.author.tag}`)
            );
            return;
        }
        if(args[1] == `coins`) {
            if(config.Coin_System == `false`) return;
            if(!args[2] || isNaN(args[2])) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid amount of coins to remove`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            message.guild.members.forEach(u => {

                if(!u.user.bot) {
                    if(!coins[u.id]) coins[u.id] = {coins: -parseInt(args[2])};
                    else coins[u.id].coins -= parseInt(args[2]);
                }
            })
            fs.writeFile("./data/coinsystem.json", JSON.stringify(coins), (err) => {
                if(err) console.log(err)
            })
            await message.channel.send(Embed({description: `**${args[2]}** coins have been removed from **ALL USERS**`, title: '**COINS REMOVED**'})).then(
                console.log(`${args[2]} coins have been removed from all users - Action performed by: ${message.author.tag}`)
            );
            return;
        }
        if(args[1] == `exp`) {
            if(config.Level_System == `false`) return;
            if(!args[2] || isNaN(args[2])) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid amount of experience to remove`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            message.guild.members.forEach(u => {

                if(!u.user.bot) {
                    if(!exp[u.id]) exp[u.id] = {xp: -parseInt(args[2])};
                    else exp[u.id].xp -= parseInt(args[2]);
                }
            })
            fs.writeFile("./data/experience.json", JSON.stringify(exp), (err) => {
                if(err) console.log(err)
            })
            await message.channel.send(Embed({description: `**${args[2]}** experience has been removed from **ALL USERS**`, title: "**XP REMOVED**"})).then(
                console.log(`${args[2]} experience has been removed from all users - Action performed by: ${message.author.tag}`)
            );
            return;
        }
    }
    else {
        if(!args[0]) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a user`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
        let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if(!user) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid user`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
        if(args[1] == `role`) {
            if(!args[2]) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a role to remove`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            let toRemove = message.guild.roles.find(r => r.name.toLowerCase() == args[2].toLowerCase());
            if(!toRemove) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please proovide a valid role to remove`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            if(!user.roles.has(toRemove.id)) return message.channel.send(Embed({preset: 'errorinfo', usage: `**${user}** does not have the **${toRemove}** role`}));
            if(toRemove.calculatedPosition >= message.guild.members.find(m => m.id == bot.user.id).highestRole.calculatedPosition) return message.channel.send(Embed({preset: 'errorinfo', usage: `I do not have the necessary permissions to add the **<@&${toRemove.id}>** role to a user`}));
            user.removeRole(toRemove)
            await message.channel.send(Embed({description: `The **<@&${toRemove.id}>** role has been removed from **${user}**`, title: '**ROLES REMOVED**'})).then(
                console.log(`The ${args[2]} role has been removed from ${user.user.tag} - Action performed by: ${message.author.tag}`)
            );
        }
        if(args[1] == `coins`) {
            if(config.Coin_System == `false`) return;
            if(!args[2] || isNaN(args[2])) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid amount of coins to remove`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
                if(user.user.bot) return message.channel.send(Embed({preset: 'errorinfo', usage: 'The user can not be a bot'})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
                if(!user.user.bot) {
                    if(!coins[u.id]) coins[u.id] = {coins: -parseInt(args[2])};
                    else coins[u.id].coins -= parseInt(args[2]);
                }
            fs.writeFile("./data/coinsystem.json", JSON.stringify(coins), (err) => {
                if(err) console.log(err)
            })
            await message.channel.send(Embed({description: `**${args[2]}** coins have been removed from **${user}**`, title: '**COINS REMOVED**'})).then(
                console.log(`${args[2]} coins have been removed from ${user.user.tag} - Action performed by: ${message.author.tag}`)
            );
            return;
        }
        if(args[1] == `exp`) {
            if(config.Level_System == `false`) return;
            if(!args[2] || isNaN(args[2])) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid amount of experience to remove`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
                if(user.user.bot) return message.channel.send(Embed({preset: 'errorinfo', usage: 'The user can not be a bot'})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
                if(!user.user.bot) {
                    if(!exp[u.id]) exp[u.id] = {xp: -parseInt(args[2])};
                    else exp[u.id].xp -= parseInt(args[2]);
                }
            fs.writeFile("./data/experience.json", JSON.stringify(exp), (err) => {
                if(err) console.log(err)
            })
            await message.channel.send(Embed({description: `**${args[2]}** experience has been removed from **${user}**`, title: '**XP REMOVED**'})).then(
                console.log(`${args[2]} experience has been removed from ${user.user.tag} - Action performed by: ${message.author.tag}`)
            );
            return;
        }
    }
}

module.exports.help = {
    name: "take"
}