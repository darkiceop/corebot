const Embed = require("../embed.js")
const Discord = require("discord.js");
const coins = require("../data/coinsystem.json");
const fs = require("fs");
const yml = require("../yml.js")

//Emojis: :Diamond: :heart: :candy: :cherries:
module.exports.run = async (bot, message, args) => {
    const config = await yml("./config.yml")
    const lang = await yml("./lang.yml")
    let userCoins = coins[message.author.id].coins;

    if(!args[0]) return message.reply(lang.Gamble_No_Amount)
    if(args[2]) return message.reply(`Usage: -slot <amount>`)

    let gambledCoins = parseInt(args[0]);
    if(!gambledCoins) return message.reply(lang.Gamble_Invalid_Amount);
    if(gambledCoins < 10) return message.reply(lang.Gamble_Atleast_10);
    if(gambledCoins > userCoins) return message.reply(lang.Gamble_Not_Enough_Coins.replace(/{coins}/g, userCoins))

    let amt;

    let randomN = ~~(Math.random()*20)+1

    //if the randomN is 1-3, multiply the money by 60-90%
    if(randomN == "1" || randomN == "2" || randomN == "3") {
        let randomP = (~~(Math.random()*30)+1)+60
        let rand = parseFloat(`0.${randomP}`);
        amt = gambledCoins+(gambledCoins*rand)

    }
    //if the randomN is 4, multiply the money by 2x
    else if(randomN == "4")
        amt = gambledCoins*2

    //if the randomN is 5-8 give their money back
    else if(randomN == "5" || randomN == "6" || randomN == "7")
        amt = gambledCoins;

    //if the randomN is 8 or 9 give them 50%-80% of what they gambled back
    else if(randomN == "8" || randomN == "9"){
        let randomP = (~~(Math.random()*30)+1)+50
        let rand = parseFloat(`0.${randomP}`);
        amt = gambledCoins*rand
    }

    //if the randomN is 10 give them 10%-40% of what they gambled back
    else if(randomN == "10"){
        let randomP = (~~(Math.random()*30)+1)+10
        let rand = parseFloat(`0.${randomP}`);
        amt = gambledCoins*rand
    }

    //if the randomN is 11-20 give them nothing back
    else amt = 0;


    //create an empty array for the emojis
    let randEmojis = [];

    //loop through 9 times, get a random emoji, and add it to the randEmojis array
    for(let i = 0; i < 9; i++) {
        let rand = ~~(Math.random()*4)+1
        if(rand == 1) randEmojis.push(":lemon:")
        if(rand == 2) randEmojis.push(":skull:")
        if(rand == 3) randEmojis.push(":heart:")
        if(rand == 4) randEmojis.push(":large_blue_diamond:")
      }
      amt = ~~amt
      //send the message
      let slotembed = new Discord.RichEmbed()
      .setColor(config.Theme_Color)
      .addField("**SLOTS**", `${randEmojis[0]} | ${randEmojis[1]} | ${randEmojis[2]}\n${randEmojis[3]} | ${randEmojis[4]} | ${randEmojis[5]}\n${randEmojis[6]} | ${randEmojis[7]} | ${randEmojis[8]}\n${message.member} you gambled **${gambledCoins}** coins and recieved back **${amt}** coins!`)
      message.channel.send(slotembed);

      //set the coins for the user
      coins[message.author.id].coins -= gambledCoins;
      coins[message.author.id].coins += amt;

      fs.writeFile("./data/coins.json", JSON.stringify(coins), (err) => {
          if(err) console.log(err)
      })
  }

  module.exports.help = {
      name: "slot"
  }
