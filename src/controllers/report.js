import options from "../../config.json"
import path from 'path';
import {isLocked, lock, unlock} from "../utils/lock";
import Report from "../models/Report";
import emitError from "./error";
import {promisify} from "util"
import fs from "fs";
import rmrf from "rimraf-promise";
import {UnknownReportFileError} from "../utils/errors";
import {socket} from "../index"

const readFile = promisify(fs.readFile);
const REPORT_FILE_STDIN = 'stdin';
const REPORT_FILE_STDOUT = 'stdout';
const REPORT_FILE_STDERR = 'stderr';
const REPORT_FILE_STARTED_AT = 'started_at';
const REPORT_FILE_ENDED_AT = 'ended_at';
const REPORT_FILE_EXIT_CODE = 'exit_code';
const REPORT_FILE_ERROR = 'error';
const readdir = promisify(fs.readdir);

export function cleanUp() {
    const reportsPath = path.resolve(options.REPORTS_PATH);

    readdir(reportsPath)
        .then(reports => reports.filter(file => /^\d+$/.test(file)))
        .then(reports => reports.map(id => {

            if (isLocked(id)) return;

            lock(id);

            const report = new Report(id);

            return report.send()
                .catch(emitError)
                .then(() => unlock(id))
                .catch(err => unlock(id));
        }))
}

export function send() {
    return Promise.all([
        sendFile(REPORT_FILE_STDIN),
        sendFile(REPORT_FILE_STDOUT),
        sendFile(REPORT_FILE_STDERR),
        sendFile(REPORT_FILE_STARTED_AT),
        sendFile(REPORT_FILE_ENDED_AT),
        sendFile(REPORT_FILE_EXIT_CODE),
        sendFile(REPORT_FILE_ERROR),
    ])
        .then(() => rmrf(this.paths.folder));
}

export function sendFile(file) {
    const path = this.paths[file];

    if (typeof path === "undefined") {
        return Promise.reject(new UnknownReportFileError());
    }

    return readFile(path, {encoding: 'utf8'})
        .then(data => {
            console.log('Emit report file: ', file, 'data :', data);

            return new Promise((resolve, reject) => {
                const timeoutID = setTimeout(reject, 60000);
                socket.emit('report', {id: this.id, type: file, data}, () => {
                    clearTimeout(timeoutID);
                    resolve();
                });
            });
        })
        .then(() => rmrf(path))
        .catch(function (e) {
            // if file doesn't exist it doesn't matter, it means it has been reported already
            if (typeof e !== "undefined" && e.code !== 'ENOENT') {
                return e;
            }
        });
}