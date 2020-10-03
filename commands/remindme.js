const Embed = require("../embed.js")
const Discord = require("discord.js");
const ms = require("ms");
const yml = require(`../yml.js`)

module.exports.run = async (bot, message, args) => {
  const config = await yml("./config.yml")
  const lang = await yml("./lang.yml")

  if(config.Temp_Mute_Command === 'false') return;

  if(config.Remove_Command_Message === `true`) message.delete();

  let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Remind_Me_Required_Rank.toLowerCase())
  if (!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Remind_Me_Required_Rank} role was not found, please create it.`))
  let hasPermission = message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
  let time = args[0];
  let toRemind = args.slice(1).join(" ")

  if(!hasPermission) return message.reply(lang.Insufficient_Permission_Message);
  if(!args[0]) return message.reply(`Usage: -remindme (time) (message)`);
  if(!time) return message.reply(`Usage: -remindme (time) (message)`);
  if(!/\d+.+/.exec(args[0])) return message.reply(`Invalid time provided! Usage: -remindme (time) (message)`);
  if(!toRemind) return message.reply(`Usage: -remindme (time) (message)`);

  message.reply(`Okay! I will remind you to **${toRemind}** in **${time}**`);
  setTimeout(function(){
    message.channel.send(`<@${message.author.id}> don't forget to **${toRemind}**!`);
  }, ms(time));


}

module.exports.help = {
  name: "remindme",
}
