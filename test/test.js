const path = require('path');
const fs = require('fs');
const EdfParser = require(path.resolve(__dirname, '../'));

describe('EdfParser', function () {
    it("Should parse raw edf data", function (done) {
        const raw = fs.readFileSync(path.resolve(__dirname, './edf/annotations.edf'));
        const parser = new EdfParser(raw);
        parser.parse()
            .then(edf => {
                if (edf.signals.length !== 1) {
                    done("Must have the only signal");
                }
                const signal = edf.signals[0];
                if (signal.data.length !== 42226) {
                    done("Must have 42226 data points");
                }
                done();
            });
    });
    it("Should read test edf file and parse it", function (done) {
        const parser = new EdfParser.EdfFileParser(path.resolve(__dirname, './edf/annotations.edf'));
        parser.parse()
            .then(edf => {
                if (edf.signals.length !== 1) {
                    done("Must have the only signal");
                }
                const signal = edf.signals[0];
                if (signal.data.length !== 42226) {
                    done("Must have 42226 data points");
                }
                done();
            });
    })
});