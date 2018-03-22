export class FileWriteError extends Error {
    constructor(error) {
        super('FileWriteError: ' + error);
        Error.captureStackTrace(this, FileWriteError);
    }
}

export class TaskTimeoutError extends Error {
    constructor(error) {
        super('TaskTimeoutError: ' + error);
        Error.captureStackTrace(this, TaskTimeoutError);
    }
}

export class TaskAlreadyRunningError extends Error {
    constructor(error) {
        super('TaskAlreadyRunningError: ' + error);
        Error.captureStackTrace(this, TaskAlreadyRunningError);
    }
}

export class TaskIdRequiredError extends Error {
    constructor(error) {
        super('TaskIdRequiredError: ' + error);
        Error.captureStackTrace(this, TaskIdRequiredError);
    }
}

export class ReportIdRequiredError extends Error {
    constructor(error) {
        super('ReportIdRequiredError: ' + error);
        Error.captureStackTrace(this, ReportIdRequiredError);
    }
}

export class UnknownReportFileError extends Error {
    constructor(error) {
        super('UnknownReportFileError: ' + error);
        Error.captureStackTrace(this, UnknownReportFileError);
    }
}
