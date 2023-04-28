const { Client } = require("discord.js");
const { load_files } = require("../functions/file_loader");
const Table = require("cli-table");
const chalk = require("chalk");
const config = require("../config/config.json");

//! ESUB MEANS EXTERNAL SUB

/**
 * Loads commands in directory ".\/events\/\*\*\/\*.ts"
 *
 * Must be called **after** defining client.commands
 * @param {Client} client
 */
async function load_commands(client, global = false) {
    const table = new Table({
        head: ["Command Name", ".", "Type", "Status"].map((str) =>
            chalk.reset(str)
        ),
        colWidths: [26, 3, 8, 8],
        chars: {
            mid: "",
            "left-mid": "",
            "mid-mid": "",
            "right-mid": "",
        },
    });

    // const devGuild = client.guilds.cache.get(config.devGuildId);

    // if (!devGuild) {
    //     return console.log("[ERROR] [HANDLER] Dev guild not found!");
    // }

    await client.commands.clear();
    await client.subCommands.clear();

    let globalCommands = [];
    let devCommands = [];

    const slashCommandFiles = await load_files("commands");
    const files = [...slashCommandFiles];

    let i = 0;
    for (const file of files) {
        i++;
        process.stdout.write(
            `[HANDLER] Loading command files: ${i}/${files.length}\r`
        );
        const command = require(file);

        if (command.ignore) {
            continue;
        }

        if (!("data" in command) && !("subCommand" in command)) {
            table.push([
                file.split("/").pop() || "unknown",
                "",
                "",
                config.cli.status_bad,
            ]);
            continue;
        }

        if (command.subCommand) {
            client.subCommands.set(command.subCommand, command);
            table.push([command.subCommand, "", "SUB", config.cli.status_ok]);
            continue;
        }
        // NOTE: command.data.name is for slash commands using the SlashCommandBuilder()
        client.commands.set(command.data.name, command);

        const type = command.data.toJSON();

        if (command.global) {
            globalCommands.push(command.data.toJSON());
            table.push([
                command.data.name,
                type ?? "0",
                "GLOBAL",
                config.cli.status_ok,
            ]);
        } else {
            devCommands.push(command.data.toJSON());
            table.push([
                command.data.name,
                type ?? "0",
                "DEV",
                config.cli.status_ok,
            ]);
        }
    }

    console.log(table.toString());

    await client.application?.commands.set(globalCommands).then((commands) => {
        console.log(`Updated ${commands.size} global commands`);
    });

    // await devGuild.commands.set(devCommands).then((commands) => {
    //     console.log(`Updated ${commands.size} guild commands`);
    // });
}

module.exports = { load_commands };
