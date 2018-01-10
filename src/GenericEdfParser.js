class GenericEdfParser {

    constructor(){
        this.timezone = 'UTC';
    }

    async parse() {
        throw new Error('Cannot use GenericEdfParser directly');
    };

}

module.exports = GenericEdfParser;