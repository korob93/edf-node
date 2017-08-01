const Zip = require('adm-zip');
const GenericEdfParser = require('./GenericEdfParser');
const EdfParser = require('./EdfParser');

const defaultOptions = {
    filter: /^.*\.edf$/
};

class EdfZipParser extends GenericEdfParser {

    constructor(path, options) {
        super();
        this.path = path;
        this.options = Object.assign({}, defaultOptions, options);
    }

    async parseEntry(entry) {
        const raw = await new Promise(
            (resolve, reject) => this.zip.readFileAsync(entry, (data, err) => {
                err && reject(err);
                resolve(data);
            })
        );
        const parser = new EdfParser(raw);
        return parser.parse()
            .then(edf => ({
                name: entry.entryName,
                edf
            }));
    }

    async parse() {
        if (!this.data) {
            this.zip = new Zip(this.path);
            const filter = typeof this.options.filter === 'function'
                ? this.options.filter : entry => this.options.filter.test(entry.entryName);
            const entries = this.zip.getEntries();
            const edfEntries = entries.filter(filter);
            this.data = await Promise.all(edfEntries.map(this.parseEntry.bind(this)));
        }
        return this.data;
    }
}

module.exports = EdfZipParser;