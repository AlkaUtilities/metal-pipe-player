const { ChatInputCommandInteraction, Client } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
    name: "interactionCreate",
    friendlyName: "commandListener",
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            return await interaction.reply({
                content: `This command is outdated. \n\`${interaction.commandName}\``,
                ephemeral: true,
            });
        } else if (command.disabled) {
            return await interaction.reply({
                content: `This command is disabled. \n\`${interaction.commandName}\``,
                ephemeral: true,
            });
        }

        if (
            command.developer &&
            !config.developersId.includes(interaction.user.id)
        )
            return await interaction.reply({
                content: "You don't have access to this command.",
                ephemeral: true,
            });

        if (command.initialReply)
            await interaction.reply({
                content: "Processing your command...",
                ephemeral: true,
            });

        const subCommand = interaction.options.getSubcommand(false);
        const subCommandGroup = interaction.options.getSubcommandGroup(false);

        if (subCommand && command.hasESub) {
            if (subCommandGroup) {
                const subCommandFile = client.subCommands.get(
                    `${interaction.commandName}.${subCommandGroup}.${subCommand}`
                );
                if (!subCommandFile) {
                    return interaction.reply({
                        content: `This sub command is outdated. \n\`${interaction.commandName}.${subCommandGroup}.${subCommand}\``,
                        ephemeral: true,
                    });
                } else subCommandFile.execute(interaction, client);
            } else {
                const subCommandFile = client.subCommands.get(
                    `${interaction.commandName}.${subCommand}`
                );
                if (!subCommandFile) {
                    return interaction.reply({
                        content: `This sub command is outdated. \n\`${interaction.commandName}.${subCommand}\``,
                        ephemeral: true,
                    });
                } else subCommandFile.execute(interaction, client);
            }
        } else command.execute(interaction, client);
    },
};
