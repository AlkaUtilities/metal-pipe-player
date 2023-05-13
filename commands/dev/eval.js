const {
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder,
    AttachmentBuilder,
} = require("discord.js");
const { inspect } = require("util");

module.exports = {
    name: "eval",
    disabled: false, // is the command disabled?
    hasESub: false, // does the command has an external sub command?
    initialReply: false, // does command execute with an initial reply?
    developer: true, // is command developer only?
    global: true, // is the command global?
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Evaluates the given command")
        .addStringOption((str) =>
            str
                .setName("command")
                .setDescription("Command to execute/evaluate")
                .setRequired(true)
        )
        .addBooleanOption((bool) =>
            bool
                .setName("ephermal")
                .setDescription("Ephermal reply (Default: false)")
                .setRequired(false)
        )
        .addBooleanOption((bool) =>
            bool
                .setName("use_txt")
                .setDescription(
                    "Replies with a txt file containing the result to bypass character limit (Default: false)"
                )
                .setRequired(false)
        )
        .setDMPermission(true),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const ephermal = interaction.options.getBoolean("ephermal") ?? false;
        const use_txt = interaction.options.getBoolean("use_txt") ?? false;
        await interaction.deferReply({ ephemeral: ephermal });
        const command = interaction.options.getString("command", true);

        try {
            // what could possibly go wrong?
            const result = await eval(command);
            let output = result;

            if (typeof result !== "string") {
                output = inspect(result);
            }

            if (use_txt) {
                const attachment = new AttachmentBuilder(
                    Buffer.from(output, "utf-8"),
                    { name: "result.txt" }
                );
                await interaction.editReply({
                    files: [attachment],
                });
            } else {
                await interaction.editReply({ content: format(output) });
            }
        } catch (err) {
            const attachment = new AttachmentBuilder(
                Buffer.from(inspect(err), "utf-8"),
                { name: "error.txt" }
            );
            await interaction.editReply({
                content:
                    "An error occured, error is not displayed as it may exceeds the maximum message length",
                files: [attachment],
            });
        }
    },
};

/**
 * Formats string
 * @param {string} string
 * @returns {string}
 */
function format(string) {
    return `\`\`\`js\n${string}\n\`\`\``;
}
