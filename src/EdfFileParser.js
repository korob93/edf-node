const fs = require("fs");
const EdfParser = require('./EdfParser');

class EdfFileParser extends EdfParser {

    constructor(path) {
        super(null);
        this.path = path;
    }

    async readFile() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.path, (err, raw) => {
                err && reject(err);
                resolve(raw);
            })
        })

    }

    async parse() {
        if (!this.edf) {
            this.raw = await this.readFile();
            await super.parse();
        }
        return this.edf;
    }

}

module.exports = EdfFileParser;