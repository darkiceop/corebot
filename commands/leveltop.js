const Embed = require("../embed.js")
const Discord = require("discord.js");
let experience = require("../data/experience.json")
const yml = require("../yml.js");
let amountToSort = 10;
module.exports.run = async (bot, message, args) => {
    let config = await yml("./config.yml");
    let result = [];

    for(let i in experience)
        result.push({
            level: experience[i].level,
            xp: experience[i].xp,
            id: i
    });
    result.sort((a, b) => b.xp - a.xp);
    let leaderboard = "";
    for(let i = 0; i < amountToSort; i++){
        if(args.length > 0 && parseInt(args[0])) i = ((parseInt(args[0])-1)*10)+i;
        if(result[i]) {
            let member = message.guild.member(result[i].id);
            leaderboard += `**#${i+1}** Level: \`\`${result[i].level}\`\` XP: \`\`${result[i].xp}\`\`- ${member ? `<@${member.id}>` : "``Unknown``"}\n`;
        }
    }
    let total = result.map(r => r.xp).reduce((acc, cv) => acc+cv);

    let EmbedVariable_Page = config.Leveltop_Embed_Title.replace(/{page}/g, args.length > 0 ? parseInt(args[0]) : 1)
    let EmbedVariable_TotalXP = EmbedVariable_Page.replace(/{totalxp}/g, ~~total)

    let FooterEmbedVariable_Page = config.Leveltop_Embed_Footer.replace(/{page}/g, args.length > 0 ? parseInt(args[0]) : 1)
    let FooterEmbedVariable_TotalXP = FooterEmbedVariable_Page.replace(/{totalxp}/g, ~~total)

    let embed = new Discord.RichEmbed()
    .setColor(config.Theme_Color)
    .setAuthor(EmbedVariable_TotalXP)
    .setDescription(leaderboard)

    if(!config.Leveltop_Embed_Footer == `false`) {
        embed.setFooter(FooterEmbedVariable_TotalXP);
    }

    message.channel.send(embed);
}
module.exports.help = {
    name: "leveltop"
}
