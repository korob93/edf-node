const path = require('path');
const fs = require('fs');
const EdfParser = require(path.resolve(__dirname, '../'));

describe('EdfParser', function () {
    it("Should read test edf file and parse it", function (done) {
        const raw = fs.readFileSync(path.resolve(__dirname, './edf/testA.edf'));
        const parser = new EdfParser(raw);
        parser.parse()
            .then(console.log)
            .then(done);
    })
});