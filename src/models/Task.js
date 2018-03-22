import {TaskIdRequiredError, TaskTimeoutError} from "../utils/errors";
import Report from "./Report";
import {spawn} from "child-process-promise";

export default class task {

    constructor(id, command, timeout, detached) {

        if (typeof id === "undefined") {
            throw new TaskIdRequiredError();
        }

        this.id = id;
        this.command = command;
        this.timeout = timeout;
        this.detached = !!detached;
        this.report = null;
        this.process = null;

        this.init = this.init.bind(this);
        this.run = this.run.bind(this);
    }

    init() {
        this.report = new Report(this.id);
        return this.report.init(this.command);
    }

    run() {
        const stdio = ['ignore', this.report.writeStreams.stdout, this.report.writeStreams.stderr];
        const detached = this.detached;

        let promise = null;

        if (process.platform === "win32") {
            promise = spawn('cmd.exe', ['/d', '/c', this.report.paths.stdin], {stdio, detached});
        } else {
            promise = spawn('bash', [this.report.paths.stdin], {stdio, detached});
        }

        this.process = promise.childProcess;

        const timeoutID = setTimeout(
            () => this.process.kill(),
            this.timeout * 1000
        );

        return promise
            .then(() => clearTimeout(timeoutID))
            .catch(() => {
                clearTimeout(timeoutID);

                if (this.process.killed) {
                    return this.report.writeError(new TaskTimeoutError());
                }

                // If the spawned task has itself an error it will be logged to stderr
            })
            .then(() => this.report.close(this.process.exitCode))
    }
}
