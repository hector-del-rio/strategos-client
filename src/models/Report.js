import {FileWriteError, ReportIdRequiredError, TaskAlreadyRunningError, UnknownReportFileError} from "../utils/errors"
import options from "../../config.json"
import moment from "moment"
import {promiseCreateWriteStream} from "../utils/promises"
import fs from "fs"
import * as path from "path";
import * as util from "util"
import {promisify} from "util"

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

export default class Report {

    constructor(id) {

        if (typeof id === "undefined") {
            throw new ReportIdRequiredError();
        }

        this.id = id;

        const folder = path.resolve(options.REPORTS_PATH, this.id.toString());

        this.paths = {
            folder,
            stdin: path.resolve(folder, options.PATH_STDIN),
            stdout: path.resolve(folder, options.PATH_STDOUT),
            stderr: path.resolve(folder, options.PATH_STDERR),
            started_at: path.resolve(folder, options.PATH_STARTED_AT),
            ended_at: path.resolve(folder, options.PATH_ENDED_AT),
            exit_code: path.resolve(folder, options.PATH_EXIT_CODE),
            error: path.resolve(folder, options.PATH_ERROR),
        };

        this.writeStreams = {
            stdout: null,
            stderr: null,
        };

        this.init = this.init.bind(this);
        this.close = this.close.bind(this);
        this.writeError = this.writeError.bind(this);
    }

    init(command) {
        let {paths} = this;

        return mkdir(paths.folder)
            .catch(err => Promise.reject(new TaskAlreadyRunningError()))
            .then(() => Promise.all([
                promiseCreateWriteStream(paths.stdout)
                    .then(({writeStream}) => this.writeStreams.stdout = writeStream),
                promiseCreateWriteStream(paths.stderr)
                    .then(({writeStream}) => this.writeStreams.stderr = writeStream),
                writeFile(paths.stdin, command),
                writeFile(paths.started_at, moment().format('YYYY-MM-DD HH:mm:ss')),
                writeFile(paths.ended_at, ''),
                writeFile(paths.exit_code, ''),
                writeFile(paths.error, ''),
            ]))
            .catch(err => Promise.reject(new FileWriteError(err)));
    }

    close(exitCode) {
        this.writeStreams.stdout.end();
        this.writeStreams.stderr.end();

        return Promise
            .all([
                writeFile(this.paths.ended_at, moment().format('YYYY-MM-DD HH:mm:ss')),
                writeFile(this.paths.exit_code, exitCode),
            ])
            .catch(err => Promise.reject(new FileWriteError()));
    }

    writeError(err) {
        const errorString = util.inspect(err);

        console.error(new Error(err));

        return writeFile(this.paths.error, errorString);
    }
}
