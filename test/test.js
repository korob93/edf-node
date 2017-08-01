const path = require('path');
const fs = require('fs');
const chai = require('chai');
chai.should();
chai.use(require('chai-things'));
const EdfParser = require(path.resolve(__dirname, '../'));

describe('EdfParser', function () {
    it("Should parse raw edf data", function (done) {
        const raw = fs.readFileSync(path.resolve(__dirname, './edf/annotations.edf'));
        const parser = new EdfParser(raw);
        parser.parse()
            .then(edf => {
                edf.signals.should.have.lengthOf(1);
                const signal = edf.signals[0];
                signal.data.should.have.lengthOf(42226);
                done();
            });
    });
    it("Should read test edf file and parse it", function (done) {
        const parser = new EdfParser.EdfFileParser(path.resolve(__dirname, './edf/annotations.edf'));
        parser.parse()
            .then(edf => {
                edf.signals.should.have.lengthOf(1);
                const signal = edf.signals[0];
                signal.data.should.have.lengthOf(42226);
                done();
            });
    })
    it("Should read test zip file and parse all edfs in it", function (done) {
        const parser = new EdfParser.EdfZipParser(path.resolve(__dirname, './edf/edf.zip'), {
            filter: /^.*\.edf\+?$/
        });
        parser.parse()
            .then(data => {
                data.should.have.lengthOf(2);
                data.should.contain.a.thing.with.property('name', 'annotations.edf');
                data.should.contain.a.thing.with.property('name', 'annotations.edf+');
                const edf0 = data[0].edf;
                const edf1 = data[1].edf;
                edf0.signals.should.have.lengthOf(1);
                const signal0 = edf0.signals[0];
                signal0.data.should.have.lengthOf(42226);
                edf1.signals.should.have.lengthOf(1);
                const signal1 = edf1.signals[0];
                signal1.data.should.have.lengthOf(42226);
                done();
            });
    })
});