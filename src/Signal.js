class Signal {

    constructor(){
        this.data = [];

        this._label = null;
        this._transducerType = null;
        this._physicalDimensions = null;
        this._physicalMin = null;
        this._physicalMax = null;
        this._digitalMin = null;
        this._digitalMax = null;
        this._prefiltering = null;
        this._numSamplesInDataRecord = null;
        this._sampleDuration = null;
        this._sampleRate = null;
        this._bytesInDataRecord = null;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    get transducerType() {
        return this._transducerType;
    }

    set transducerType(value) {
        this._transducerType = value;
    }

    get physicalDimensions() {
        return this._physicalDimensions;
    }

    set physicalDimensions(value) {
        this._physicalDimensions = value;
    }

    get physicalMin() {
        return this._physicalMin;
    }

    set physicalMin(value) {
        this._physicalMin = parseInt(value, 10);
    }

    get physicalMax() {
        return this._physicalMax;
    }

    set physicalMax(value) {
        this._physicalMax = parseInt(value, 10);
    }

    get digitalMin() {
        return this._digitalMin;
    }

    set digitalMin(value) {
        this._digitalMin = parseInt(value, 10);
    }

    get digitalMax() {
        return this._digitalMax;
    }

    set digitalMax(value) {
        this._digitalMax = parseInt(value, 10);
    }

    get prefiltering() {
        return this._prefiltering;
    }

    set prefiltering(value) {
        this._prefiltering = value;
    }

    get numSamplesInDataRecord() {
        return this._numSamplesInDataRecord;
    }

    set numSamplesInDataRecord(value) {
        this._numSamplesInDataRecord = parseInt(value, 10);
    }

    get sampleDuration() {
        return this._sampleDuration;
    }

    set sampleDuration(value) {
        this._sampleDuration = parseInt(value, 10);
    }

    get sampleRate() {
        return this._sampleRate;
    }

    set sampleRate(value) {
        this._sampleRate = parseInt(value, 10);
    }

    get bytesInDataRecord() {
        return this._bytesInDataRecord;
    }

    set bytesInDataRecord(value) {
        this._bytesInDataRecord = parseInt(value, 10);
    }

}

module.exports = Signal;