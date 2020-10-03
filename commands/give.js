const Embed = require("../embed.js")
const Discord = require("discord.js");
const coins = require("../data/coinsystem.json");
const exp = require("../data/experience.json");
const fs = require("fs");
const yml = require("../yml.js");

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    const lang = await yml("./lang.yml");
    if(config.Give_Command == `false`) return;
    let usage = `give <@user/all> <coins/exp/role> <amount/role name>`
    if(config.Coin_System == `false`) {
        usage = `give <@user/all> <exp/role> <amount/role name>`
    }
    if(config.Level_System == `false`) {
        usage = `give <@user/all> <coins/role> <amount/role name>`
    }
    if(config.Coin_System == `false` && config.Level_System == `false`) {
        usage = `give <@user/all> <role> <role name>`
    }
    const role = message.guild.roles.find(r => r.name.toLowerCase() == config.Give_Required_Rank.toLowerCase())
    const hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
    if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Give_Required_Rank} role was not found, please create it.`))
    if(!hasPermission) return message.channel.send(Embed({preset: 'nopermission'}));
    if(!args[0]) return message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`}));

    if(args[0] == `all`) {
        if(!args[1] == `role` || !args[1] == `coins` || !args[1] == `exp`) return message.channel.send(Embed({preset: 'errorinfo', usage: `Valid options: coins, exp, role`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
        if(args[1] == `role`) {
            if(!args[2]) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a role to give`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            let toGive = message.guild.roles.find(r => r.name.toLowerCase() == args[2].toLowerCase());
            if(!toGive) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid role to give`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            if(toGive.calculatedPosition >= message.guild.members.find(m => m.id == bot.user.id).highestRole.calculatedPosition) return message.channel.send(Embed({preset: 'errorinfo', usage: `I do not have the necessary permissions to add the **<@&${toGive.id}>** role to a user`}));
            message.channel.send(`*Adding roles to all users. This may take some time...*`)
            message.guild.members.forEach(u => {
                u.addRole(toGive)
            })
            await message.channel.send(Embed({description: `The **<@&${toGive.id}>** role has been added to **ALL USERS**`, title: '**ROLES ADDED**'})).then(
                console.log(`The ${args[2]} role has been added to all users - Action performed by: ${message.author.tag}`)
            );
            return;
        }
        if(args[1] == `coins`) {
            if(config.Coin_System == `false`) return;
            if(!args[2] || isNaN(args[2])) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid amount of coins to give`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            message.guild.members.forEach(u => {

                if(!u.user.bot) {
                    if(!coins[u.id]) coins[u.id] = {coins: parseInt(args[2])};
                    else coins[u.id].coins += parseInt(args[2]);
                }
            })
            fs.writeFile("./data/coinsystem.json", JSON.stringify(coins), (err) => {
                if(err) console.log(err)
            })
            await message.channel.send(Embed({description: `**${args[2]}** coins have been added to **ALL USERS**`, title: '**COINS ADDED**'})).then(
                console.log(`${args[2]} coins have been added to all users - Action performed by: ${message.author.tag}`)
            );
            return;
        }
        if(args[1] == `exp`) {
            if(config.Level_System == `false`) return;
            if(!args[2] || isNaN(args[2])) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid amount of experience to give`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            message.guild.members.forEach(u => {

                if(!u.user.bot) {
                    if(!exp[u.id]) exp[u.id] = {xp: parseInt(args[2])};
                    else exp[u.id].xp += parseInt(args[2]);
                }
            })
            fs.writeFile("./data/experience.json", JSON.stringify(exp), (err) => {
                if(err) console.log(err)
            })
            await message.channel.send(Embed({description: `**${args[2]}** experience has been added to **ALL USERS**`, title: "**XP ADDED**"})).then(
                console.log(`${args[2]} experience has been added to all users - Action performed by: ${message.author.tag}`)
            );
            return;
        }
    }
    else {
        if(!args[0]) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a user`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
        let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if(!user) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid user`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
        if(args[1] == `role`) {
            if(!args[2]) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a role to give`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            let toGive = message.guild.roles.find(r => r.name.toLowerCase() == args[2].toLowerCase());
            if(!toGive) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please proovide a valid role to give`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
            if(user.roles.has(toGive.id)) return message.channel.send(Embed({preset: 'errorinfo', usage: `**${user}** already has the **${toGive}** role`}));
            if(toGive.calculatedPosition >= message.guild.members.find(m => m.id == bot.user.id).highestRole.calculatedPosition) return message.channel.send(Embed({preset: 'errorinfo', usage: `I do not have the necessary permissions to add the **<@&${toGive.id}>** role to a user`}));
            user.addRole(toGive)
            await message.channel.send(Embed({description: `The **<@&${toGive.id}>** role has been added to **${user}**`, title: '**ROLES ADDED**'})).then(
                console.log(`The ${args[2]} role has been added to ${user.user.tag} - Action performed by: ${message.author.tag}`)
            );
        }
        if(args[1] == `coins`) {
            if(config.Coin_System == `false`) return;
            if(!args[2] || isNaN(args[2])) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid amount of coins to give`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
                if(user.user.bot) return message.channel.send(Embed({preset: 'errorinfo', usage: 'The user can not be a bot'})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
                if(!user.user.bot) {
                    if(!coins[u.id]) coins[u.id] = {coins: parseInt(args[2])};
                    else coins[u.id].coins += parseInt(args[2]);
                }
            fs.writeFile("./data/coinsystem.json", JSON.stringify(coins), (err) => {
                if(err) console.log(err)
            })
            await message.channel.send(Embed({description: `**${args[2]}** coins have been added to **${user}**`, title: '**COINS ADDED**'})).then(
                console.log(`${args[2]} coins have been added to ${user.user.tag} - Action performed by: ${message.author.tag}`)
            );
            return;
        }
        if(args[1] == `exp`) {
            if(config.Level_System == `false`) return;
            if(!args[2] || isNaN(args[2])) return message.channel.send(Embed({preset: 'errorinfo', usage: `Please provide a valid amount of experience to give`})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
                if(user.user.bot) return message.channel.send(Embed({preset: 'errorinfo', usage: 'The user can not be a bot'})).then(message.channel.send(Embed({preset: 'invalidargs', usage: `${usage}`})));
                if(!user.user.bot) {
                    if(!exp[u.id]) exp[u.id] = {xp: parseInt(args[2])};
                    else exp[u.id].xp += parseInt(args[2]);
                }
            fs.writeFile("./data/experience.json", JSON.stringify(exp), (err) => {
                if(err) console.log(err)
            })
            await message.channel.send(Embed({description: `**${args[2]}** experience has been added to **${user}**`, title: '**XP ADDED**'})).then(
                console.log(`${args[2]} experience has been added to ${user.user.tag} - Action performed by: ${message.author.tag}`)
            );
            return;
        }
    }
}

module.exports.help = {
    name: "give"
}