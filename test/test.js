const path = require('path');
const fs = require('fs');
const chai = require('chai');
const moment = require('moment-timezone');
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));
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
            })
            .catch(done);
    });
    it("Should read test edf file and parse it", function (done) {
        const parser = new EdfParser.EdfFileParser(path.resolve(__dirname, './edf/annotations.edf'));
        parser.parse()
            .then(edf => {
                edf.signals.should.have.lengthOf(1);
                const signal = edf.signals[0];
                signal.data.should.have.lengthOf(42226);
                done();
            })
            .catch(done);
    });
    it("Should read test edf file throw exception", function (done) {
        const parser = new EdfParser.EdfFileParser(path.resolve(__dirname, './edf/0001.wmedf'));
        parser.parse().should.be.rejected.and.notify(done);
    });
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
            })
            .catch(done);
    });
    it("Should read test zip file and parse all edfs in it", function (done) {
        this.timeout(25000);
        const parser = new EdfParser.EdfZipParser(path.resolve(__dirname, './edf/edf1.zip'), {
            filter: /^.*\.edf\+?$/
        });
        parser.parse()
            .then(() => done())
            .catch(done);
    });
    it("Should respect provided timezone", function (done) {
        const parser = new EdfParser.EdfFileParser(path.resolve(__dirname, './edf/annotations.edf'));
        parser.timezone = 'CET';
        parser.parse()
            .then(edf => {
                const same = moment(edf.startTime).isSame('2017-01-07T23:58:58.000Z');
                same.should.be.true;
                done();
            })
            .catch(done);
    })
});