const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    Client,
} = require("discord.js");
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection,
    AudioPlayerStatus,
    AudioPlayer,
} = require("@discordjs/voice");
const fs = require("fs");
const { inspect } = require("util");

const config = require("../../config/config.json");
let audioCfg = require("../../config/audio_cfg.json");
const path = require("path");
const internal = require("stream");

module.exports = {
    name: "play",
    disabled: false, // is the command disabled?
    hasESub: false, // does the command has an external sub command?
    initialReply: false, // does command execute with an initial reply?
    developer: false, // is command developer only?
    global: true, // is the command global?
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Plays the selected audio")
        .addNumberOption((num) =>
            num
                .setName("index")
                .setDescription(
                    "Index of the audio to be played. Use /list to see a list of the available audio(s)"
                )
                .setMinValue(1)
                .setRequired(false)
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    execute(interaction, client) {
        // FIX items in the audios array randomly changes, wether its
        // the path or the name have no idea whats the cause of this
        const audios = require("../../config/audios.json");
        // console.log(audios);
        if (!interaction.member.voice.channel) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            iconURL: client.user.displayAvatarURL({
                                size: 128,
                            }),
                            name: "You need to join a voice channel first",
                        })
                        .setColor(config.embeds.bad),
                ],
            });
        }

        const getConnection = getVoiceConnection(interaction.guildId);
        if (
            getConnection &&
            interaction.member.voice.channel.id !==
                getConnection.joinConfig.channelId
        ) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            iconURL: client.user.displayAvatarURL({
                                size: 128,
                            }),
                            name: "You need to be in the same vc as the bot to be able to use this command",
                        })
                        .setColor(config.embeds.bad),
                ],
                ephemeral: true,
            });
        }

        let index = interaction.options.getNumber("index", false);

        if (!(interaction.guildId in audioCfg)) {
            // default value
            audioCfg[interaction.guildId] = {
                name: audios[0].name,
                path: audios[0].path,
                delay: { min: 30000, max: 300000 },
            };
        }

        // if its somehow undefined
        if (!audioCfg[interaction.guildId] && index === undefined) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            iconURL: client.user.displayAvatarURL({
                                size: 128,
                            }),
                            name: "Audio is not set. Please set using `/play <index>` or use `/list` to see a list of the available audio",
                        })
                        .setColor(config.embeds.bad),
                ],
            });
        }

        // This is because in `/list` or list.js, the index starts with a 1 instead of a 0, therefore we should decrement the value of index here by 1
        index--;

        if (index > audios.length - 1) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            iconURL: client.user.displayAvatarURL({
                                size: 128,
                            }),
                            name: `Index cannot be greater than the available audio(s)`,
                        })
                        .setColor(config.embeds.bad),
                ],
            });
        }

        if (audios[index] !== undefined) {
            audioCfg[interaction.guildId].name = audios[index].name;
            audioCfg[interaction.guildId].path = path.join(
                process.cwd(),
                audios[index].path
            );

            //  Saves it to a json file
            //! Using database is recommended if bot is
            //! being used in a large amount of server
            //! at the same time
            fs.writeFileSync(
                path.join(process.cwd(), "config/audio_cfg.json"),
                JSON.stringify(audioCfg, null, 4)
            );
        }

        // joins vc
        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        // creates a player
        const player = createAudioPlayer();

        // subscribe to player
        connection.subscribe(player);

        const guild = client.guilds.cache.get(interaction.guildId);
        const channel = guild.channels.cache.get(
            interaction.member.voice.channel.id
        );

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        iconURL: client.user.displayAvatarURL({ size: 128 }),
                        name: `Playing ${
                            audioCfg[interaction.guildId].name
                        } at #${channel.name}`,
                    })
                    .setColor(config.embeds.ok),
            ],
        });

        let check;

        function getDelay() {
            max = audioCfg[interaction.guildId].delay.max;
            min = audioCfg[interaction.guildId].delay.min;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function refreshCheck() {
            audioCfg = require("../../config/audio_cfg.json");
            check = getVoiceConnection(interaction.guildId) !== undefined;
        }

        /**
         * @param {AudioPlayer} player Audio player
         * @param {string} path Full path to audio file
         * @param {CallableFunction} delayFunc Function that returns the delay in ms
         */
        function playAudio(player, path, delayFunc) {
            if (check) {
                delay = delayFunc();
                console.log(`playing in ${delay}ms`);
                setTimeout(() => {
                    player.play(createAudioResource(path));
                    playAudio(player, path, delayFunc);
                    refreshCheck();
                }, delay);
            }
        }

        refreshCheck();
        playAudio(player, audioCfg[interaction.guildId].path, getDelay);
    },
};
