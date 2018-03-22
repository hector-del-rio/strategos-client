import moment from "moment"

const _cl = console.log;
console.log = function () {
    _cl(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] `, ...arguments)
};

const _ce = console.error;
console.error = function () {
    _ce(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] `, ...arguments)
};

const _cw = console.warn;
console.warn = function () {
    _cw(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] `, ...arguments)
};
