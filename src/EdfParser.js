const GenericEdfParser = require('./GenericEdfParser');
const Edf = require('./Edf');
const Signal = require('./Signal');
const Buffer = require('buffer').Buffer;

const EDF_ANNOTATIONS_LABEL = 'EDF Annotations';
const SAMPLE_BYTE_LENGTH = 2;

const NUL = 0x0;
const DC4 = 0x14;
const NAK = 0x15;

const TALS_DELIMITER = Buffer.from([DC4, NUL]);
const ANNOTATIONS_DELIMITER = Buffer.from([DC4]);
const ONESET_DELIMITER = Buffer.from([NAK]);

const headerSpec = [
    { "name": "version", "length": 8 },
    { "name": "patientId", "length": 80 },
    { "name": "recordingId", "length": 80 },
    { "name": "startDate", "length": 8 },
    { "name": "startTime", "length": 8 },
    { "name": "numberOfBytes", "length": 8 },
    { "name": "reserved", "length": 44 },
    { "name": "numDataRecords", "length": 8 },
    { "name": "durationOfDataRecord", "length": 8 },
    { "name": "numSignalsInDataRecord", "length": 4 }
];

const signalSpec = [
    { "name": "label", "length": 16 },
    { "name": "transducerType", "length": 80 },
    { "name": "physicalDimensions", "length": 8 },
    { "name": "physicalMin", "length": 8 },
    { "name": "physicalMax", "length": 8 },
    { "name": "digitalMin", "length": 8 },
    { "name": "digitalMax", "length": 8 },
    { "name": "prefiltering", "length": 80 },
    { "name": "numSamplesInDataRecord", "length": 8 }
];


class EdfParer extends GenericEdfParser {

    constructor(raw) {
        super();
        this.raw = raw;
    }

    computeAdditionalEdfParams() {
        this.edf.numSamplesInDataRecord = 0;
        this.edf.bytesInDataRecord = 0;
        this.edf.getSignals().forEach(signal => {
            this.edf.numSamplesInDataRecord += signal.numSamplesInDataRecord;
            this.edf.bytesInDataRecord += signal.bytesInDataRecord;
        })
    }

    async parseEdfHeaders() {
        let start = 0;
        headerSpec.forEach(spec => {
            const end = start + spec.length;
            this.edf[spec.name] = this.raw.slice(start, end).toString().trim();
            start = end;
        });
    }

    computeAdditionalSignalParams(signal) {
        signal.sampleDuration = signal.numSamplesInDataRecord / this.edf.durationOfDataRecord;
        signal.sampleRate = this.edf.durationOfDataRecord / signal.numSamplesInDataRecord;
        signal.bytesInDataRecord = signal.numSamplesInDataRecord * SAMPLE_BYTE_LENGTH;

    }

    async parseSignalHeaders() {
        const signalsCount = this.edf.numSignalsInDataRecord;
        for (let i = 0; i < signalsCount; i++) {
            this.edf.getSignals().push(new Signal());
        }
        let start = 256;
        signalSpec.forEach(
            spec => this.edf.getSignals().forEach(signal => {
                const end = start + spec.length;
                signal[spec.name] = this.raw.slice(start, end).toString().trim();
                start = end;
            })
        );
        this.edf.getSignals().forEach(this.computeAdditionalSignalParams.bind(this));
        this.computeAdditionalEdfParams();
    }

    async parseSignalSamples(signal, block, timeOffset) {
        let offset = 0;
        for (let i = 0; i < signal.numSamplesInDataRecord; i++) {
            const value = block.readInt16LE(offset);
            signal.data.push({
                time: new Date(this.edf.startTime.getTime() + (timeOffset + i * signal.sampleDuration) * 1000),
                value
            });
            offset += SAMPLE_BYTE_LENGTH;
        }
    }

    splitBuffer(buffer, delimiter) {
        const lines = [];
        let search;
        while ((search = buffer.indexOf(delimiter)) > -1) {
            lines.push(buffer.slice(0, search));
            buffer = buffer.slice(search + delimiter.length, buffer.length);
        }
        buffer.length && lines.push(buffer);
        return lines;
    }

    async parseAnnotationSamples(signal, block) {
        const tals = this.splitBuffer(block, TALS_DELIMITER);
        tals.forEach(tal => {
            if (tal.indexOf(DC4) < 0) {
                return;
            }
            const [onset, ...rawAnnotations] = this.splitBuffer(tal, ANNOTATIONS_DELIMITER);
            const [rawStart, rawDuration = Buffer.from([NUL])] = this.splitBuffer(onset, ONESET_DELIMITER);
            const start = parseFloat(rawStart.toString());
            const duration = parseFloat(rawDuration.toString());
            rawAnnotations.forEach(rawAnnotation => {
                signal.data.push({
                    time: new Date(this.edf.startTime.getTime() + start * 1000),
                    value: rawAnnotation.toString().trim(),
                    duration
                })
            });
        });
    }

    async parseDataRecord(dataRecord, timeOffset) {
        let start = 0;
        return Promise.all(this.edf.getSignals().map(signal => {
            const end = start + signal.bytesInDataRecord;
            const block = dataRecord.slice(start, end);
            start = end;
            if (signal.label === EDF_ANNOTATIONS_LABEL) {
                return this.parseAnnotationSamples(signal, block);
            } else {
                return this.parseSignalSamples(signal, block, timeOffset);
            }
        }));
    }

    async parseSignalData() {
        let start = 256 * (this.edf.numSignalsInDataRecord + 1);
        const promises = [];
        for (let i = 0; i < this.edf.numDataRecords; i++) {
            const timeOffset = i * this.edf.durationOfDataRecord;
            const end = start + this.edf.bytesInDataRecord;
            const dataRecord = this.raw.slice(start, end);
            promises.push(this.parseDataRecord(dataRecord, timeOffset));
            start = end;
        }
        return Promise.all(promises);
    }

    async parse() {
        if (!this.edf) {
            this.edf = new Edf();
            await this.parseEdfHeaders();
            await this.parseSignalHeaders();
            await this.parseSignalData();
        }
        return this.edf;
    }

}

module.exports = EdfParer;