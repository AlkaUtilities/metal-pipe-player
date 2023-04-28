const { Client, ActivityType } = require("discord.js");
const { load_commands } = require("../../handlers/command");

module.exports = {
    name: "ready",
    once: true,
    /**
     *
     * @param {Client} client
     */
    execute(client) {
        load_commands(client);

        client.user.setPresence({
            activities: [
                {
                    name: "/play",
                    type: ActivityType.Streaming,
                    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                },
            ],
        });

        console.log(`Logged in as ${client.user.tag}`);
    },
};
