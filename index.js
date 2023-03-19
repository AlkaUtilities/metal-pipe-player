//! made with shitty code by chatgpt

// metal pipe player bot lore:
// kyhri: why did we do this
// alden: it was ur idea
// kyhri: stfu

require('dotenv').config();
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { Client, Intents } = require('discord.js');
const { spawn } = require('child_process');

// this uses ALL intent which is bad practice, 
// i was lazy to figure out which intent it needed tho 
// - aldenizenmc
const client = new Client({ intents: 131071 });

const prefix = '-'; // prefix to run command (change it to whatever you like)

client.on('ready', () => {
    client.user.setPresence({
        activities: [{
            name: "-play",
            type: "STREAMING",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }]
    });

    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    switch (command) {
        case "play": {
            if (!message.member.voice.channel) {
                return message.reply('You need to join a voice channel first!');
            }
    
            const audioFile = "./help.mp3"; //.mp3 file path
            
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
    
            // i have no idea what any of this does but if it works, it works
            const player = createAudioPlayer();
            player.play(createAudioResource(audioFile));
            connection.subscribe(player);
            player.on(AudioPlayerStatus.Idle, () => {
                player.play(createAudioResource(audioFile));
            })
        };
        break;
    }
    
});

client.login(process.env.TOKEN);

// https://github.com/aldenizenmc was here :)