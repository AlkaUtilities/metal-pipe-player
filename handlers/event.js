const { Client } = require("discord.js");
const { load_files } = require("../functions/file_loader");
const Table = require("cli-table");
const chalk = require("chalk");
const config = require("../config/config.json");

/**
 * Loads events in directory ".\/events\/\*\*\/*.ts"
 *
 * Must be called **after** defining client.events
 * @param {Client} client
 */
async function load_events(client) {
    const table = new Table({
        head: ["Event Name", "Status"].map((str) => chalk.reset(str)),
        colWidths: [26, 11],
        chars: {
            mid: "",
            "left-mid": "",
            "mid-mid": "",
            "right-mid": "",
        },
    });

    await client.events.clear(); // deletes all item in client.events collection

    const files = await load_files("events");

    let validEvents = 0;
    let invalidEvents = 0;

    let i = 0;
    for (const file of files) {
        i++;
        process.stdout.write(
            `[HANDLER] Loading event files: ${i}/${files.length}\r`
        );
        const event = require(file);
        if (!event.name) {
            // check if file has property "name"
            table.push([
                event.friendlyName
                    ? event.friendlyName.length > 18
                        ? chalk.cyan(event.friendlyName.slice(0, 18) + "...")
                        : chalk.cyan(event.friendlyName)
                    : event.name
                    ? event.name
                    : file.split("/").pop(),
                config.cli.status_bad,
            ]);
            invalidEvents++;
            continue;
        }

        const execute = (...args) => event.execute(...args, client);
        client.events.set(event.name, execute);
        validEvents++;

        if (event.rest) {
            if (event.once) client.rest.once(event.name, execute); // rest, once
            else client.rest.on(event.name, execute); // rest, on
        } else if (!event.rest) {
            if (event.once) client.once(event.name, execute); // normal, once
            else client.on(event.name, execute); // normal on
        }

        table.push([
            event.friendlyName
                ? event.friendlyName.length > 18
                    ? chalk.cyan(event.friendlyName.slice(0, 18) + "...")
                    : chalk.cyan(event.friendlyName)
                : event.name
                ? event.name
                : file.split("/").pop(),
            config.cli.status_ok,
        ]);
    }
    console.log(table.toString());
}

module.exports = { load_events };
