const { glob } = require("glob");
const path = require("path");

/**
 * Deletes cached file
 * @param {string} file
 */
async function delete_cached_file(file) {
    const filePath = path.resolve(file);
    if (require.cache[filePath]) {
        delete require.cache[filePath];
    }
}

/**
 * Loads file from .\/dirName\/\*\*\/\*.js
 * @param {string} dirName Name of directory
 * @returns
 */
async function load_files(dirName) {
    try {
        const files = await glob(
            path.join(process.cwd(), dirName, "**/*.js").replace(/\\/g, "/")
        );
        const jsFiles = files.filter((file) => path.extname(file) === ".js");
        await Promise.all(jsFiles.map(delete_cached_file));
        return jsFiles;
    } catch (err) {
        console.log(
            `[ERROR] Unable to load files from directory: ${dirName}\n${err}`
        );
        throw err;
    }
}

module.exports = { delete_cached_file, load_files };
