require("dotenv").config();

const { Client, IntentsBitField, Partials, Collection } = require("discord.js");

const { load_events } = require("./handlers/event");

const { Guilds, GuildVoiceStates } = IntentsBitField.Flags;

const client = new Client({
    intents: [Guilds, GuildVoiceStates],
});

client.events = new Collection();
client.commands = new Collection();
client.subCommands = new Collection();

load_events(client);

// uncomment the line below for monitoring purposes
// require("express")().get("/", (_, res) => res.sendStatus(200)).listen(3000, () => console.log("Listening on port 3000"));

client.login(process.env.TOKEN);
