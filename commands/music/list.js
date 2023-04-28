const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");

const { embedPages } = require("../../handlers/pages");

const config = require("../../config/config.json");
const audios = require("../../config/audios.json");

module.exports = {
    name: "list",
    disabled: false, // is the command disabled?
    hasESub: false, // does the command has an external sub command?
    initialReply: false, // does command execute with an initial reply?
    developer: false, // is command developer only?
    global: false, // is the command global?
    data: new SlashCommandBuilder()
        .setName("list")
        .setDescription("Shows a list of the available audio(s)"),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const list = audios.map((i) => `\` ${audios.indexOf(i)} \` ${i.name}`);

        const embedDescriptions = [];

        // this part took forever to make
        for (const name of list) {
            // check if the length is currently 0 (no embeds)
            // add the first item
            if (embedDescriptions.length === 0) {
                embedDescriptions[0] = [];
            }

            // gets the last sub-array (to get the last sub-array,
            // just subtract length by 1, so if theres an array,
            // length = 1, to get it, array[length-1] = array[1-1] = array[0]
            let temp = embedDescriptions[embedDescriptions.length - 1];

            // adds the current item to temp
            temp.push(name);

            // check if the current sub-array plus the current item joined with "\\n"
            // would exceed the specified limit
            //
            // 4096 is the embed limit
            // 17 is for the footer ("Page XXX from XXX")
            if (temp.join("\\n").length >= 4096 + 17) {
                // if it exceeds make a new sub-array with the current item
                embedDescriptions[embedDescriptions.length] = [name];
            } else {
                // if it doesnt then make the current sub-array the same as temp
                // (which already has the current item in it)
                embedDescriptions[embedDescriptions.length - 1] = temp;
            }
        }

        const embeds = [];

        // turn all of them into embeds
        for (const desc of embedDescriptions) {
            embeds.push(
                new EmbedBuilder()
                    .setDescription(desc.join("\n"))
                    .setColor(config.embeds.ok)
            );
        }

        // use embedpages
        await embedPages(client, interaction, embeds);
    },
};
