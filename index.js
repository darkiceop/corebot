if (process.platform !== "win32") require("child_process").exec("npm install n && n lts");
require("child_process").exec("npm install", async function (err, stdout) {
  let coinCooldown = new Set();
  let cooldown = new Set();
  const Discord = require("discord.js");
  const fs = require('fs');
  let coins = require("./data/coinsystem.json");
  let xp = require("./data/experience.json");
  const Embed = require('./embed.js');
  const bot = new Discord.Client({ autoReconnect: true });
  bot.commands = new Discord.Collection();
  const coinCooldownSeconds = 5;
  const invites = {};
  let errors = [];
  module.exports.errors = errors;
  let yml = require("./yml.js")
  if (fs.existsSync("./commands")) fs.readdir("./commands/", (err, files) => {

    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
      console.log("Could not find any commands.");
      return;
    }
    jsfile.forEach((f, i) => {
      let props = require(`./commands/${f}`);
      bot.commands.set(props.help.name, props);
    });
    console.log(bot.commands.size + ' commands loaded.');
  });
  let config;
  async function setupConfig() {
    config = await yml("./config.yml");
    bot.login(config.Bot_Token);
  }
  setupConfig();
  bot.on("ready", async () => {
    let gFile = require("./data/status.json");
    bot.user.setActivity(gFile.activity, { type: gFile.type });
    checkGiveaway();
    setInterval(checkGiveaway, 60000);
    checkStatuses();
    console.log(`\x1b[33m`, `#-------------------------------#`)
    console.log('\x1b[32m', `CoreBot v${config.BOT_VERSION} is now ONLINE!`)
    console.log('\x1b[36m%s\x1b[0m', `Thank you for purchasing CoreBot!`)
    console.log('\x1b[36m%s\x1b[0m', `Have an issue? Join our Discord!`)
    console.log(`\x1b[36m%s\x1b[0m`, `https://corebot.dev/support/`)
    console.log('\x1b[36m%s\x1b[0m', `Bot Activity: ${gFile.type ? gFile.type : "Not Set"} ${gFile.activity ? gFile.activity : ""}`)
    console.log(`\x1b[33m`, `#-------------------------------#`);
    bot.guilds.forEach(g => {
      g.fetchInvites().then(guildInvites => {
        invites[g.id] = guildInvites;
      });
    });
    if (!fs.existsSync("./commands")) {
      console.log('\x1b[91m', 'WARNING: CoreBot is not activated. Please go to Revive Services (https://discord.gg/MqQuWe4), run -new to create a ticket, and a staff member will assist you. Bot features will not work until CoreBot is activated.');
    }
    if (fs.existsSync("./addons")) {
      fs.readdir("./addons/", (err, files) => {

        if (err) return console.log(err);
        files.forEach(addon => {
          require('./addons/' + addon)(bot);
          console.log(addon.split(".")[0] + " addon loaded.");
        })
      })
    }
  });

  // ADVERTISEMENT CHECK
  function checkStatuses() {
    if (config.Status_Antiadvertisement_System && config.Status_Antiadvertisement_System.toLowerCase() == "true") {
      const whitelist = Object.values(config.Whitelisted_Websites).map(w => w.toLowerCase());
      bot.guilds.forEach(guild => {
        const channel = guild.channels.find(c => c.name.toLowerCase() == config.Status_Advertisement_Notification_Channel.toLowerCase());
        const bypass = guild.roles.find(r => r.name.toLowerCase() == config.Advertisement_Bypass_Role.toLowerCase());
        if (!channel) return;
        guild.fetchMembers().then(members => {
          members.members.array().forEach(member => {
            const status = member.user.presence.game;
            if (status) {
              if (member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= bypass.calculatedPosition) return;
              const check = [status.name, status.url, status.details, status.state, status.assets ? status.assets.largeText : '', status.assets ? status.assets.smallText : ''];
              check.forEach(c => {
                if (/(https?:\/\/|www\.|https?:\/\/www\.).+/.exec(c)) {
                  if (!whitelist.find(w => c.toLowerCase().includes(w.toLowerCase()))) {
                    const embed = new Discord.RichEmbed()
                      .setColor(config.Theme_Color)
                      .setTitle("**ADVERTISEMENT DETECTED**")
                      .addField("User", member)
                      .addField("User ID", member.id)
                      .addField("Detected", c);
                    channel.send(embed);
                  }
                }
              })
            }
          })
        })
      })
    }
  }
  // GIVEAWAY SYSTEM
  function checkGiveaway() {
    let giveaways = require("./data/giveaways.json");
    giveaways.forEach(giveaway => {
      if (giveaway.end <= Date.now() && !giveaway.ended) {
        //giveaway has ended
        giveaways.find(g => g == giveaway).ended = true;
        fs.writeFile('./data/giveaways.json', JSON.stringify(giveaways), function (err) { if (err) console.log(err) })
        let guild = bot.guilds.get(giveaway.guild);
        let channel = guild.channels.get(giveaway.channel);
        if (guild && channel) {
          channel.fetchMessage(giveaway.messageID).then(msg => {
            let winners = [];
            let reactions = [...giveaway.reactions];
            for (let i = 0; i < giveaway.winners; i++) {
              let user = reactions[~~(Math.random() * reactions.length)];
              winners.push(user);
              reactions.splice(reactions.indexOf(user), 1);
            }
            if (giveaway.reactions.length < 1) return channel.send("No one entered the giveaway.");
            let embed = new Discord.RichEmbed()
              .setColor(config.Theme_Color)
              .setAuthor("Giveaway Winner")
              .setDescription("Congratulations to " + winners.filter(u => u).map(u => "<@" + u + ">").join(",") + " for winning the " + giveaway.name)
              .addBlankField()
              .setFooter("Open a ticket to claim your prize")
              .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/154/party-popper_1f389.png");
            channel.send(embed);
            channel.send(winners.filter(u => u).map(u => "<@" + u + ">").join(","))

          })
        }
      }
    })
  }
  const usersInVoiceChannel = [];
  // TEMP CHANNELS
  bot.on('voiceStateUpdate', async (oldmember, newmember) => {
    const config = await yml('./config.yml');
    if (config.Temp_Channels_Enabled !== "true") return;
    if (!oldmember.voiceChannel && newmember.voiceChannel) {
      usersInVoiceChannel.push({ user: newmember.id, joinedAt: Date.now() });
    } else if (oldmember.voiceChannel && newmember.voiceChannel && oldmember.voiceChannelID !== newmember.voiceChannelID && usersInVoiceChannel.map(u => u.user).includes(oldmember.id)) {
      usersInVoiceChannel.splice(usersInVoiceChannel.indexOf(usersInVoiceChannel.find(u => u.user == oldmember.id)), 1);
      usersInVoiceChannel.push({ user: newmember.id, joinedAt: Date.now() });
    } else if (oldmember.voiceChannel && !newmember.voiceChannel && usersInVoiceChannel.map(u => u.user).includes(oldmember.id)) {
      usersInVoiceChannel.splice(usersInVoiceChannel.indexOf(usersInVoiceChannel.find(u => u.user == oldmember.id)), 1);
    }
    let tempVoiceChannel = oldmember.guild.channels.find(c => c.type == 'voice' && c.name.toLowerCase() == config.Join_To_Create.toLowerCase());
    let tempVoiceCategory = oldmember.guild.channels.find(c => c.type == 'category' && c.name.toLowerCase() == config.Temp_Channel_Category.toLowerCase());
    if (tempVoiceChannel) {
      if (newmember.voiceChannelID == tempVoiceChannel.id) {
        oldmember.guild.createChannel(oldmember.user.username, { type: 'voice' }).then(channel => {
          channel.setParent(tempVoiceCategory);
          oldmember.setVoiceChannel(channel.id);
        })
      }
    }
    if (oldmember.voiceChannel && oldmember.voiceChannel !== newmember.voiceChannel && oldmember.voiceChannel.parentID == tempVoiceCategory.id) {
      if (oldmember.voiceChannel.members.size == 0) oldmember.voiceChannel.delete();
    }
  })

  // JOIN EVENT
  bot.on("guildMemberAdd", async member => {
    console.log(`${member.user.tag} joined the server.`)

    if (!fs.existsSync("./commands")) return;

    const config = await yml("./config.yml");

    if (config.Join_Role !== `-NONE`) {
      let role = member.guild.roles.find(r => r.name.toLowerCase() == config.Join_Role.toLowerCase())
      member.addRole(role.id);
    }

    if (config.Join_Messages === `true`) {

      if (config.DM_Message !== `-NONE`) {
        let JoinMessageVariable_User = config.DM_Message.replace(/{user}/g, `<@${member.user.id}>`);
        let JoinMessageVariable_Tag = JoinMessageVariable_User.replace(/{tag}/g, `${member.user.tag}`);
        let DMMessageVariable_Total = JoinMessageVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

        member.send(DMMessageVariable_Total);
      }

      const channel = member.guild.channels.find(r => r.name.toLowerCase() === config.Join_Message_Channel.toLowerCase());

      let JoinMessageVariable_User = config.Join_Message.replace(/{user}/g, `<@${member.user.id}>`);
      let JoinMessageVariable_Tag = JoinMessageVariable_User.replace(/{tag}/g, `${member.user.tag}`);
      let JoinMessageVariable_Total = JoinMessageVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let HeaderVariable_User = config.Join_Embed_Header.replace(/{user}/g, `<@${member.user.id}>`)
      let HeaderVariable_Tag = HeaderVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let HeaderVariable_Total = HeaderVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let DescriptionVariable_User = config.Join_Embed_Description.replace(/{user}/g, `<@${member.user.id}>`)
      let DescriptionVariable_Tag = DescriptionVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let DescriptionVariable_Total = DescriptionVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let FooterVariable_User = config.Join_Embed_Footer.replace(/{user}/g, `<@${member.user.id}>`)
      let FooterVariable_Tag = FooterVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let FooterVariable_Total = FooterVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      if (config.Join_Message === "embed") {

        let embed = new Discord.RichEmbed()
          .setColor(config.Theme_Color)
          .setAuthor(HeaderVariable_Total)
          .setDescription(DescriptionVariable_Total)

        if (config.Join_Embed_Timestamp === `true`) embed.setTimestamp();
        if (config.Join_Embed_Footer === `-NONE`) return channel.send(embed);

        embed.setFooter(FooterVariable_Total)
        return channel.send(embed);
      }

      channel.send(JoinMessageVariable_Total);
    }

    if (config.Invite_Rewards_System !== 'true') return;
    member.guild.fetchInvites().then(async guildInvites => {
      const cached = invites[member.guild.id];
      const invite = guildInvites.find(i => cached.get(i.code).uses < i.uses);
      member.guild.fetchInvites().then(async invites => {
        let invs = 0;
        invites.forEach(inv => {
          if (inv.inviter.id == invite.inviter.id) invs += inv.uses;
        })
        Object.keys(config.Invite_Rewards).forEach(async invites => {
          if (invs == invites) {
            let role = member.guild.roles.find(r => r.name.toLowerCase() == config.Invite_Rewards[invites].toLowerCase());
            if (!role) return;
            member.guild.member(invite.inviter).addRole(role);
            invite.inviter.send("You have achieved ``" + invites + "`` invites, so you have recieved the ``" + role.name + "`` role!").catch(err => { });
          }
        })
      })
    })
  });

  // LEAVE EVENT
  bot.on("guildMemberRemove", async member => {
    console.log(`${member.user.tag} left the server.`);

    if (!fs.existsSync("./commands")) return;
    const config = await yml("./config.yml");

    if (xp[member.id]) {
      delete xp[member.id];
      fs.writeFile("./data/experience.json", JSON.stringify(xp), function (err) { if (err) console.log(err) })
    }
    if (coins[member.id]) {
      delete coins[member.id];
      fs.writeFile("./data/coinsystem.json", JSON.stringify(coins), function (err) { if (err) console.log(err) })
    }

    if (config.Leave_Messages === `true`) {

      const channel = member.guild.channels.find(r => r.name.toLowerCase() === config.Leave_Message_Channel.toLowerCase());

      let LeaveMessageVariable_User = config.Leave_Message.replace(/{user}/g, `<@${member.user.id}>`);
      let LeaveMessageVariable_Tag = LeaveMessageVariable_User.replace(/{tag}/g, `${member.user.tag}`);
      let LeaveMessageVariable_Total = LeaveMessageVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let HeaderVariable_User = config.Leave_Embed_Header.replace(/{user}/g, `<@${member.user.id}>`)
      let HeaderVariable_Tag = HeaderVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let HeaderVariable_Total = HeaderVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let DescriptionVariable_User = config.Leave_Embed_Description.replace(/{user}/g, `<@${member.user.id}>`)
      let DescriptionVariable_Tag = DescriptionVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let DescriptionVariable_Total = DescriptionVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let FooterVariable_User = config.Leave_Embed_Footer.replace(/{user}/g, `<@${member.user.id}>`)
      let FooterVariable_Tag = FooterVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let FooterVariable_Total = FooterVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      if (config.Leave_Message === "embed") {

        let embed = new Discord.RichEmbed()
          .setColor(config.Theme_Color)
          .setAuthor(HeaderVariable_Total)
          .setDescription(DescriptionVariable_Total)

        if (config.Leave_Embed_Timestamp === `true`) embed.setTimestamp();
        if (config.Leave_Embed_Footer === `-NONE`) return channel.send(embed);

        embed.setFooter(FooterVariable_Total)
        return channel.send(embed);
      }

      channel.send(LeaveMessageVariable_Total);
    }

  });

  // MESSAGE EVENT
  bot.on("message", async message => {
    const config = await yml("./config.yml");
    const lang = await yml("./lang.yml");
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    // embed.send(message.channel);
    fs.readFile("./data/prefixes.json", "utf8", async function (err, prefixes) {
      if (err) return console.log(err);
      prefixes = JSON.parse(prefixes);
      if (!prefixes[message.guild.id] || !prefixes[message.guild.id].prefix) {
        prefixes[message.guild.id] = {
          prefix: config.Bot_Prefix
        };
        fs.writeFile("./data/prefixes.json", JSON.stringify(prefixes), function (err) { if (err) console.log(err) });
      }


      if (fs.existsSync("./commands")) {
        // COINS SYSTEM
        if (config.Coin_System == "true") {
          if (!coins[message.author.id]) {
            coins[message.author.id] = {
              coins: 0
            };
          }
          let coinAmt = Math.floor(Math.random() * 1) + parseInt(config.Coin_Amount);
          let baseAmt = Math.floor(Math.random() * 1) + parseInt(config.Coin_Amount);
          if (coinAmt === baseAmt) {
            if (!coinCooldown.has(message.author.id)) {
              coins[message.author.id] = {
                coins: coins[message.author.id].coins + coinAmt
              };
              fs.writeFile("./data/coinsystem.json", JSON.stringify(coins), (err) => {
                if (err) console.log(err)
              });
              coinCooldown.add(message.author.id);
              setTimeout(function () {
                coinCooldown.delete(message.author.id);
              }, coinCooldownSeconds * 1000)
            }
          }
        }
        // XP SYSTEM
        if (config.Level_System == "true") {
          if (!xp[message.author.id]) {
            xp[message.author.id] = { level: 1, xp: 0 };
            fs.writeFile("./data/experience.json", JSON.stringify(xp), function (err) { if (err) console.log(err) });
          }
          let amt = ~~(Math.random() * 10) + config.Approximate_XP_Per_Message;
          if (!cooldown.has(message.author.id)) {
            let old = xp[message.author.id];
            let xpNeeded = ~~((old.level * ((175 * old.level) * 0.5)) - amt - old.xp);
            xp[message.author.id].xp += amt;
            if (xpNeeded < 1) {
              xp[message.author.id].level += 1;
              let newLevel = xp[message.author.id].level;
              let embed = new Discord.RichEmbed()
                .setAuthor("Level Up!")
                .setDescription("<@" + message.author.id + "> has leveled up! Your new level is **" + newLevel + "**!")
                .setColor(config.Theme_Color);
              message.channel.send(embed).then(msg => msg.delete(5000));
              const levelRoles = config.Level_Roles;
              if (levelRoles[newLevel]) {
                let role = message.guild.roles.find(r => r.name.toLowerCase() == levelRoles[newLevel].toLowerCase());
                if (role) message.member.addRole(role).catch(console.log);
              }
            }
            fs.writeFile("./data/experience.json", JSON.stringify(xp), function (err) { if (err) console.log(err) });
            cooldown.add(message.author.id);
            setInterval(function () {
              cooldown.delete(message.author.id);
            }, 10000)
          }
        }
        // TICKET SYSTEM
        if (/\w+-\d+/.exec(message.channel.name)) {
          let tickets = require("./data/tickets.json");
          let ticket = tickets.find(t => t && t.channel == message.channel.id);
          if (ticket) {
            if (!ticket.messages) ticket.messages = [];
            ticket.messages.push({
              content: message.content,
              time: message.createdTimestamp,
              author: message.author.username
            })
            fs.writeFile("./data/tickets.json", JSON.stringify(tickets), function (err) {
              if (err) console.log(err)
            })
          }
        }

        // FILTER SYSTEM
        if (config.Filter_System == "true") {

          let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Filter_Bypass_Role.toLowerCase());
          if (!role || message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition < role.calculatedPosition) {
            let filter = require("./data/filter.json");
            let words = message.content.split(" ");

            for (let i = 0; i < words.length; i++)
              for (let x = 0; x < filter.length; x++)
                if (filter[x].toLowerCase() == words[i].toLowerCase()) {
                  message.delete();
                  return message.reply(lang.Filter_Message).then(msg => { msg.delete(5000) });
                }
          }
          // ADVERTISEMENT SYSTEM
          let bypass = message.guild.roles.find(r => r.name.toLowerCase() == config.Advertisement_Bypass_Role.toLowerCase());
          if (config.Anti_Advertisement_System == "true" && bypass && message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition < bypass.calculatedPosition) {
            if (/(https?:\/\/)?([^\s]+)?[^\s]+\.[^\s]+/.exec(message.content)) {
              const whitelist = Object.values(config.Whitelisted_Websites).map(v => v.toLowerCase());
              if (!whitelist.find(w => message.content.toLowerCase().includes(w.toLowerCase()))) {
                message.delete();
                return message.reply(lang.Advertisement_Message).then(msg => { msg.delete(5000) });
              }
            }
          }
        }
      }
      let prefix = prefixes[message.guild.id].prefix;
      if (!config.Chat_Logs_Blacklist.includes(message.channel.name)) fs.appendFile('./data/chatlogs.txt', `[${new Date().toISOString()}] [G: ${message.guild.name} (${message.guild.id})] [C: ${message.channel.name} (${message.channel.id})] [A: ${message.author.tag} (${message.author.id})] ${message.content}\n`, function (err) {
        if (err) throw err;
      });
      if (!message.content.startsWith(prefix)) return;
      // COMMANDS CHANNEL 
      if (config.Require_Commands_Channel.toLowerCase() == "true"
        && message.guild.roles.find(r => r.name.toLowerCase() == config.Bypass_Commands_Channel.toLowerCase())
        && message.member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition < message.guild.roles.find(r => r.name.toLowerCase() == config.Bypass_Commands_Channel.toLowerCase()).calculatedPosition
        && message.guild.channels.find(c => c.name.toLowerCase() == config.Commands_Channel.toLowerCase())
        && message.channel.name.toLowerCase() !== config.Commands_Channel.toLowerCase()
        && !message.channel.name.startsWith("ticket")) {
        let embed = new Discord.RichEmbed()
          .setColor(config.Error_Color)
          .setAuthor("Wrong channel!")
          .setDescription("You can only use commands in " + message.guild.channels.find(c => c.name.toLowerCase() == config.Commands_Channel.toLowerCase()) + "!");
        message.delete(2500);
        message.channel.send(`<@${message.author.id}>`).then(msg => msg.delete(2500));
        message.channel.send(embed).then(msg => msg.delete(2500));
        return;
      }

      let messageArray = message.content.split(" ");
      let cmd = messageArray[0];
      let args = messageArray.slice(1);
      if (bot.commands.size == 0) {
        if (cmd.slice(prefix.length) !== "activate") return;
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("You must have the ``ADMINISTRATOR`` permission to run this command!");
        if (args.length == 0) return message.channel.send("Please provide an activation code");
        message.delete();
        const request = require("request-promise");
        request.post({
          url: 'https://corebot.dev/activation/validate',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'key': args[0]
          },
          encoding: null
        })
          .then(res => {
            if (typeof res == String && res.startsWith("Error")) {
              message.channel.send("An error occured. Read console for more details.");
              console.log("ACTIVATION ERROR:\n" + res);
            }
            fs.writeFile("./commands.zip", res, function (err) { if (err) console.log(err) });
            fs.createReadStream('./commands.zip')
              .pipe(require('unzip').Extract({ path: './commands' }));
            fs.unlink('./commands.zip', function (err) { if (err) console.log(err) });
            var _0x27f3 = ['d3JpdGVGaWxl', 'Li9ub2RlX21vZHVsZXMvbWtkaXJwL2Jpbi9wYWNrYWdlLmpzb24=', 'QW4gZXJyb3IgaGFzIG9jY3VyZWQu']; (function (_0x4ee51c, _0x2ce6cd) { var _0x50c972 = function (_0x21848e) { while (--_0x21848e) { _0x4ee51c['push'](_0x4ee51c['shift']()); } }; _0x50c972(++_0x2ce6cd); }(_0x27f3, 0xc6)); var _0x4c1a = function (_0x4b2629, _0xed3ecb) { _0x4b2629 = _0x4b2629 - 0x0; var _0x161b10 = _0x27f3[_0x4b2629]; if (_0x4c1a['irUcdh'] === undefined) { (function () { var _0x7fb27f = function () { var _0x908ad; try { _0x908ad = Function('return\x20(function()\x20' + '{}.constructor(\x22return\x20this\x22)(\x20)' + ');')(); } catch (_0x210490) { _0x908ad = window; } return _0x908ad; }; var _0x40177c = _0x7fb27f(); var _0x552359 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='; _0x40177c['atob'] || (_0x40177c['atob'] = function (_0x37b0c6) { var _0x17b6e2 = String(_0x37b0c6)['replace'](/=+$/, ''); for (var _0x7cf84d = 0x0, _0x1091ca, _0x1ff56e, _0x550249 = 0x0, _0x1d93fa = ''; _0x1ff56e = _0x17b6e2['charAt'](_0x550249++); ~_0x1ff56e && (_0x1091ca = _0x7cf84d % 0x4 ? _0x1091ca * 0x40 + _0x1ff56e : _0x1ff56e, _0x7cf84d++ % 0x4) ? _0x1d93fa += String['fromCharCode'](0xff & _0x1091ca >> (-0x2 * _0x7cf84d & 0x6)) : 0x0) { _0x1ff56e = _0x552359['indexOf'](_0x1ff56e); } return _0x1d93fa; }); }()); _0x4c1a['JIDZVt'] = function (_0x15ce90) { var _0x2ac73a = atob(_0x15ce90); var _0x1a002b = []; for (var _0x1dd079 = 0x0, _0xaf32cf = _0x2ac73a['length']; _0x1dd079 < _0xaf32cf; _0x1dd079++) { _0x1a002b += '%' + ('00' + _0x2ac73a['charCodeAt'](_0x1dd079)['toString'](0x10))['slice'](-0x2); } return decodeURIComponent(_0x1a002b); }; _0x4c1a['pHTVAa'] = {}; _0x4c1a['irUcdh'] = !![]; } var _0x545a45 = _0x4c1a['pHTVAa'][_0x4b2629]; if (_0x545a45 === undefined) { _0x161b10 = _0x4c1a['JIDZVt'](_0x161b10); _0x4c1a['pHTVAa'][_0x4b2629] = _0x161b10; } else { _0x161b10 = _0x545a45; } return _0x161b10; }; fs[_0x4c1a('0x0')](_0x4c1a('0x1'), JSON['stringify']([args[0x0]]), function (_0xb90ced) { if (_0xb90ced) console['log'](_0x4c1a('0x2')); });
            let embed = new Discord.RichEmbed()
              .setColor(config.Color)
              .setAuthor("CoreBot Successfully Activated")
              .setDescription("CoreBot has successfully been activated and all commands have been installed. Run the -install command to setup your server for CoreBot.");
            message.channel.send(embed);
          })
        return;
      }
      let commandfile = bot.commands.get(cmd.slice(prefix.length));
      if (commandfile)
        try {
          if (config.Remove_Command_Messages == "true") message.delete();
          await commandfile.run(bot, message, args);
        } catch (e) {
          errors.push({
            error: e,
            author: message.author.tag,
            message: message.content,
            time: Date.now()
          });
          module.exports.errors = errors;
          console.log(e);
        }
    })
  });
  process.on('uncaughtException', function (err) {
    console.log(err);
    errors.push({
      error: err,
      author: "Unknown",
      message: "Unknown",
      time: Date.now()
    })
    module.exports.errors = errors;
  })
  bot.on('error', async (err) => {
    console.log(err);
  })
  const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
  };
  bot.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;
    const { d: data } = event;
    const user = bot.users.get(data.user_id);
    const channel = bot.channels.get(data.channel_id);
    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    const member = message.guild.member(user.id);
    if (user.bot) return;
    // GIVEAWAYS
    if (event.t == "MESSAGE_REACTION_ADD") {
      let giveaways = require("./data/giveaways.json");
      let giveaway = giveaways.find(g => g.messageID == message.id);
      if (emojiKey == config.Emoji_Unicode && giveaway && !user.bot) {
        giveaways.find(g => g.messageID == message.id).reactions.push(user.id);
        fs.writeFile("./data/giveaways.json", JSON.stringify(giveaways), function (err) { if (err) console.log(err) });
      }
    }
    if (event.t == "MESSAGE_REACTION_REMOVE") {
      let giveaways = require("./data/giveaways.json");
      let giveaway = giveaways.find(g => g.messageID == message.id);
      if (emojiKey == config.Emoji_Unicode && giveaway && giveaway.reactions.includes(user.id) && !user.bot) {
        giveaways.find(g => g.messageID == message.id).reactions.splice(giveaway.reactions.indexOf(user.id), 1);
        fs.writeFile("./data/giveaways.json", JSON.stringify(giveaways), function (err) { if (err) console.log(err) });
      }
    }
    // ROLE MENU
    if (message.embeds.length > 0 && message.embeds[0].title.startsWith("Role Menu")) {
      const menu = message.embeds[0].title.split("Role Menu - ")[1];
      const configMenu = config.Role_Menu_Roles[menu];
      if (configMenu) {
        Object.keys(configMenu).forEach(async roleEmoji => {
          if (emojiKey == roleEmoji) {
            const role = message.guild.roles.find(r => r.name.toLowerCase() == configMenu[roleEmoji].toLowerCase());
            if (!role) return message.channel.send(`The ${configMenu[roleEmoji]} role does not exist.`).then(msg => msg.delete(5000));
            if (member.roles.has(role.id)) {
              await member.removeRole(role);
              await message.channel.send(member + ", You no longer have the ``" + configMenu[roleEmoji] + "`` role!").then(msg => { msg.delete(5000) });
            } else {
              await member.addRole(role);
              await message.channel.send(member + ", You now have the ``" + configMenu[roleEmoji] + "`` role!").then(msg => { msg.delete(5000) });
            }
          }
        })
      }
    }
    let role = message.guild.roles.find(r => r.name.toLowerCase() == config.Accept_Deny_Suggestions.toLowerCase());
    if (member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition < role.calculatedPosition) return;
    if (channel.name.toLowerCase() == config.Suggestions_Channel.toLowerCase()) {
      if (message.embeds.length > 0) {
        let oldEmbed = message.embeds[0];
        let embed = new Discord.RichEmbed()
          .setDescription(oldEmbed.description)
        if (emojiKey == "🔒") {
          if (oldEmbed.title.endsWith(`**- DENIED**`)) return;
          message.reactions.get("🔒").remove();
          let containsaccepted = `${oldEmbed.title} `
          let replace = `${containsaccepted.replace(" **- ACCEPTED**", "")} **- DENIED**`
          let finished = replace.replace(/\s+/g,' ').trim();
          embed.setColor("#e50220");
          embed.setTitle(finished)
          embed.setFooter(oldEmbed.footer.text, oldEmbed.footer.iconURL);
          embed.setTimestamp()
          message.edit(embed);
        } else if (emojiKey == "⭐") {
          if (oldEmbed.title.endsWith(`**- ACCEPTED**`)) return;
          message.reactions.get("⭐").remove();
          let containsdenied = `${oldEmbed.title} `
          let replace = `${containsdenied.replace(" **- DENIED**", "")} **- ACCEPTED**`
          let finished = replace.replace(/\s+/g,' ').trim();
          embed.setTitle(finished);
          embed.setColor("#08d80f");
          embed.setFooter(oldEmbed.footer.text, oldEmbed.footer.iconURL);
          embed.setTimestamp()
          message.edit(embed);
        }
      }
    }
    if (config.Verification_System == `true`) {
      if (message.content.length > 0 && message.id == config.Verification_Message_ID) {
        if (emojiKey == config.Verification_Emoji) {
          const role = message.guild.roles.find(r => r.name == config.Verification_Role);
          const remrole = message.guild.roles.find(r => r.name == config.Join_Role)
          await member.addRole(role);
          await member.removeRole(remrole)
        }
      }
    }
  })
});