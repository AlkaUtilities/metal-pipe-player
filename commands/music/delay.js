const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");
const fs = require("fs");

const config = require("../../config/config.json");
const audioCfg = require("../../config/audio_cfg.json");
const audios = require("../../config/audios.json");
const path = require("path");

module.exports = {
    name: "delay",
    disabled: false, // is the command disabled?
    hasESub: false, // does the command has an external sub command?
    initialReply: false, // does command execute with an initial reply?
    developer: false, // is command developer only?
    global: true, // is the command global?
    data: new SlashCommandBuilder()
        .setName("delay")
        .setDescription(
            "Sets the min/max value of the random interval between audio plays"
        )
        .addIntegerOption((int) =>
            int
                .setName("min")
                .setDescription("Sets the minimum value of the random interval")
                .setRequired(true)
                .setMinValue(1)
        )
        .addIntegerOption((int) =>
            int
                .setName("max")
                .setDescription("Sets the maximum value of the random interval")
                .setRequired(true)
                .setMinValue(1)
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const min = interaction.options.getInteger("min", true) * 1000;
        const max = interaction.options.getInteger("max", true) * 1000;

        if (!(interaction.guildId in audioCfg)) {
            // default value
            audioCfg[interaction.guildId] = {
                name: audios[0].name,
                path: audios[0].path,
                delay: { min: min, max: max },
            };
        }

        audioCfg[interaction.guildId].delay = {
            min: min,
            max: max,
        };

        fs.writeFileSync(
            path.join(process.cwd(), "config/audio_cfg.json"),
            JSON.stringify(audioCfg, null, 4)
        );

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        iconURL: client.user.displayAvatarURL({ size: 128 }),
                        name: `Changed delay to a random value between ${
                            min / 1000
                        } seconds to ${max / 1000} seconds`,
                    })
                    .setColor(config.embeds.ok),
            ],
        });
    },
};
