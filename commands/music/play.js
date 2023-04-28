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
    AudioPlayerStatus,
} = require("@discordjs/voice");
const fs = require("fs");

const config = require("../../config/config.json");
const audios = require("../../config/audios.json");
const audioCfg = require("../../config/audio_cfg.json");
const path = require("path");

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
                .setRequired(false)
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    execute(interaction, client) {
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

        const index = interaction.options.getNumber("index", false);

        if (!(interaction.guildId in audioCfg)) {
            // automatically set it to the first object in audios
            audioCfg[interaction.guildId] = audios[0];
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

        if (index < 0 || index > audios.length - 1) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            iconURL: client.user.displayAvatarURL({
                                size: 128,
                            }),
                            name: `Index cannot be less than 0 or greater than the available audio(s)`,
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

        // plays audio
        player.play(createAudioResource(audioCfg[interaction.guildId].path));

        // replays the audio on idle
        player.on(AudioPlayerStatus.Idle, () =>
            player.play(createAudioResource(audioCfg[interaction.guildId].path))
        );

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
    },
};
