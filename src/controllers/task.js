import Task from "../models/Task";
import {lock, unlock} from "../utils/lock";
import {TaskAlreadyRunningError} from "../utils/errors";
import emitError from './error'

/**
 *
 * @param data Object
 * @param data.id integer
 * @param data.command string
 * @param data.max_run_seconds integer
 * @param data.run_detached integer
 * @param acknowledgeReception Function
 */
export function receiveTask(data, acknowledgeReception) {
    console.log('TASK RECEIVED => ', data);

    // TODO: validate task data structure

    const task = new Task(
        data.id,
        data.command,
        data.max_run_seconds,
        data.run_detached
    );

    lock(task.id);

    task.init()
        .then(acknowledgeReception)
        .then(task.run)
        .catch(err => {

            if (err instanceof TaskAlreadyRunningError) {
                return;
            }

            // If an error occurs while writing the error to a file, try to emit it directly to the server
            return task.report.writeError(err)
                .catch(err => emitError(err));
        })
        .then(task.report.send)
        .catch(emitError)
        .then(() => unlock(task.id))
        .catch(err => unlock(task.id))
}