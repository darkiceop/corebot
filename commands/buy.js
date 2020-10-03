const Embed = require("../embed.js")
const Discord = require("discord.js");
const coins = require("../data/coinsystem.json");
const fs = require("fs")
let yml = require("../yml.js")

module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml");
    const lang = await yml("./lang.yml");

    if(config.Coin_System === `false`) return;
    if(config.Shop_System == `false`) return;

    const items = [
        {
            "item": `${config.Item_1}`,
            "coins": `${config.Item_1_Price}`,
            "type": "role",
            "role": `${config.Item_1_Role}`
        },

        {
            "item": `${config.Item_2}`,
            "coins": `${config.Item_2_Price}`,
            "type": "role",
            "role": `${config.Item_2_Role}`
        },

        {
            "item": `${config.Item_3}`,
            "coins": `${config.Item_3_Price}`,
            "type": "role",
            "role": `${config.Item_3_Role}`
        }
    ]

    let found = items.find(i => i.item.toLowerCase() == args.join(" ").toLowerCase())
    if (!found) return message.reply(lang.Invalid_Item);
    let userCoins = coins[message.author.id].coins;
    let price = found.coins;
    if (userCoins < price) return message.reply(lang.Not_Enough_Coins)
    coins[message.author.id].coins -= price;

    let EmbedVariable_Item = lang.Purchase_Success.replace(/{item}/g, found.item);
    let EmbedVariable_Price = EmbedVariable_Item.replace(/{price}/g, found.coins);

    if (found.type == "role") {
        let role = message.guild.roles.find(r => r.name.toLowerCase() == found.role.toLowerCase());
        if (!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${found.role} role was not found, please create it.`))
        if(message.member.roles.has(role.id)) return message.reply(lang.Already_Bought)
        message.member.addRole(role.id);
        message.reply(EmbedVariable_Price);
    }

    fs.writeFile("./data/coinsystem.json", JSON.stringify(coins), (err) => {
        if (err) console.log(err)
    })
}

module.exports.help = {
    name: "buy"
}