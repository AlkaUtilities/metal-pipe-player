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
 * @param {boolean} global Load global commands?
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

    const devGuild = client.guilds.cache.get(config.devGuildId);

    if (!devGuild) {
        return console.log(
            chalk.bgRedBright(" ERROR ") + " HANDLER Dev guild not found!"
        );
    }

    await client.commands.clear();
    await client.subCommands.clear();

    let globalCommands = [];
    let devCommands = [];

    const slashCommandFiles = await load_files("commands");
    // const contextMenusFiles = await load_files("contextMenus");
    const files = [...slashCommandFiles];

    let validCommands = 0;
    let invalidCommands = 0;
    let subCommands = 0;

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
            invalidCommands++;
            continue;
        }

        if (command.subCommand) {
            client.subCommands.set(command.subCommand, command);
            table.push([command.subCommand, "", "SUB", config.cli.status_ok]);
            subCommands++;
            continue;
        }
        // NOTE: command.data.name is for slash commands using the SlashCommandBuilder()
        client.commands.set(command.data.name, command);
        validCommands++;

        const type = command.data.toJSON();

        if (command.global) {
            globalCommands.push(command.data.toJSON());
            table.push([
                command.data.name,
                type ?? "0",
                "GLOBAL",
                config.cli.status_ok,
            ]);
        } else if (command.global && global === false) {
            continue; // if command is global but global is false
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

    if (global) {
        await client.application?.commands
            .set(globalCommands)
            .then((commands) => {
                console.log(`Updated ${commands.size} global commands`);
            });
    } else console.log("Global commands were not updated");

    await devGuild.commands.set(devCommands).then((commands) => {
        console.log(`Updated ${commands.size} guild commands`);
    });
}

module.exports = { load_commands };
