//! made with shitty code by chatgpt

// metal pipe player bot lore:
// kyhri: why did we do this
// alden: it was ur idea
// kyhri: stfu

require("dotenv").config();
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
} = require("@discordjs/voice");
const { Client, Intents, MessageEmbed } = require("discord.js");
const { spawn } = require("child_process");
const config = require("./audio.json");

let currentAudio = {
    name: config[0].name ?? config[0].path,
    path: config[0].path,
};

// this uses ALL intent which is bad practice,
// i was lazy to figure out which intent it needed tho
// - aldenizenmc
const client = new Client({ intents: 131071 });

const prefix = "-"; // prefix to run command (change it to whatever you like)

client.on("ready", () => {
    client.user.setPresence({
        activities: [
            {
                name: "-play",
                type: "STREAMING",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
        ],
    });

    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(" ");
    const command = args.shift().toLowerCase();

    switch (command) {
        case "play":
            {
                if (!message.member.voice.channel) {
                    return message.reply(
                        "You need to join a voice channel first!"
                    );
                }

                if (currentAudio.path == undefined) {
                    return message.reply(
                        "Audio path is undefined.\nPlease reset using `mode <index>`"
                    );
                }

                const connection = joinVoiceChannel({
                    channelId: message.member.voice.channel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });

                // i have no idea what any of this does but if it works, it works
                const player = createAudioPlayer();
                player.play(createAudioResource(currentAudio.path));
                connection.subscribe(player);
                player.on(AudioPlayerStatus.Idle, () => {
                    player.play(createAudioResource(currentAudio.path));
                });

                const guild = client.guilds.cache.get(message.guild.id);
                const channel = guild.channels.cache.get(
                    message.member.voice.channel.id
                );

                message.reply(
                    `Playing \` ${currentAudio.name} \` at \` #${channel.name} \` on loop`
                );
            }
            break;

        case "mode":
            {
                if (!args.length) {
                    const embed = new MessageEmbed()
                        .setTitle("Library")
                        .setDescription(
                            `Usage: \`${prefix}mode <index>\`\n\n` +
                                config
                                    .map(
                                        (i) =>
                                            `\` ${config.indexOf(i)} \` ${
                                                i.name
                                            }`
                                    )
                                    .join("\n")
                        );
                    return message.reply({ embeds: [embed] });
                }

                if (isNaN(args[0]))
                    return message.reply(
                        `Argument is not a number.\nInput \` ${args[0]} \` `
                    );

                if (config[args[0]] === undefined) {
                    const embed = new MessageEmbed()
                        .setTitle("Library")
                        .setDescription(
                            `Usage: \`${prefix}mode <index>\`\n` +
                                `Error: Index \` ${args[0]} \` is undefined.\n\n` +
                                config
                                    .map(
                                        (i) =>
                                            `\` ${config.indexOf(i)} \` ${
                                                i.name
                                            }`
                                    )
                                    .join("\n")
                        );
                    return message.reply({ embeds: [embed] });
                }

                const prevAudio = currentAudio;

                currentAudio = {
                    name: config[args[0]].name ?? config[args[0]].path,
                    path: config[args[0]].path,
                };

                message.reply(
                    `Switched from \` ${
                        prevAudio.name ?? prevAudio.path
                    } \` to \` ${currentAudio.name ?? currentAudio.path} \``
                );
            }
            break;
    }
});

client.login(process.env.TOKEN);

// https://github.com/aldenizenmc was here :)
