const moment = require('moment-timezone');


const EDF_DATE_REGEX = /^.*(\d{2}-(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-\d{4}).*$/;

class Edf {

    constructor(timezone) {
        this.signals = [];
        this.timezone = timezone;

        this._version = null;
        this._patientId = null;
        this._recordingId = null;
        this._startDate = null;
        this._startTime = null;
        this._numberOfBytes = null;
        this._numDataRecords = null;
        this._durationOfDataRecord = null;
        this._numSignalsInDataRecord = null;
        this._bytesInDataRecord = null;
        this._numSamplesInDataRecord = null;
    }

    getSignals() {
        return this.signals;
    }

    get version() {
        return this._version;
    }

    set version(value) {
        this._version = value;
    }

    get patientId() {
        return this._patientId;
    }

    set patientId(value) {
        this._patientId = value;
    }

    get recordingId() {
        return this._recordingId;
    }

    set recordingId(value) {
        this._recordingId = value;
    }

    get startDate() {
        return this._startDate;
    }

    set startDate(value) {
        let match = this.recordingId.match(EDF_DATE_REGEX);
        if (match) {
            this._startDate = moment.tz(`${match[1]}`, 'DD-MMM-YYYY', this.timezone).toDate();
        } else {
            const dateParts = value.split('.').map(part => parseInt(part, 10));
            let year = dateParts[2];
            if (year < 0 || year > 99) {
                throw new Error('Invalid start date');
            }
            if (year < 84) {
                year += 2000;
            }
            else {
                year += 1900;
            }
            this._startDate = moment.tz({
                year,
                month: dateParts[1] - 1,
                day: dateParts[0]
            }, this.timezone).toDate();
        }

    }

    get startTime() {
        return this._startTime;
    }

    set startTime(value) {
        let timeParts = value.split('.').map(part => parseInt(part, 10));
        this._startTime = moment(this.startDate).add(moment.duration({
            hours: timeParts[0],
            minutes: timeParts[1],
            seconds: timeParts[2]
        })).toDate();
    }

    get numberOfBytes() {
        return this._numberOfBytes;
    }

    set numberOfBytes(value) {
        this._numberOfBytes = parseInt(value, 10);
    }

    get numDataRecords() {
        return this._numDataRecords;
    }

    set numDataRecords(value) {
        this._numDataRecords = parseInt(value, 10);
    }

    get durationOfDataRecord() {
        return this._durationOfDataRecord;
    }

    set durationOfDataRecord(value) {
        this._durationOfDataRecord = parseFloat(value);
    }

    get numSignalsInDataRecord() {
        return this._numSignalsInDataRecord;
    }

    set numSignalsInDataRecord(value) {
        this._numSignalsInDataRecord = parseInt(value, 10);
    }

    get bytesInDataRecord() {
        return this._bytesInDataRecord;
    }

    set bytesInDataRecord(value) {
        this._bytesInDataRecord = parseInt(value, 10);
    }

    get numSamplesInDataRecord() {
        return this._numSamplesInDataRecord;
    }

    set numSamplesInDataRecord(value) {
        this._numSamplesInDataRecord = parseInt(value, 10);
    }

}

module.exports = Edf;