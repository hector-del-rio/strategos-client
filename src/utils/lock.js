let locks = [];

export function isLocked(id) {
    id = parseInt(id);

    if (isNaN(id)) {
        console.error("Parameter id must be an integer");
        return;
    }

    return locks.indexOf(id) > -1
}

export function lock(id) {
    id = parseInt(id);

    if (isNaN(id)) {
        console.error("Parameter id must be an integer");
        return;
    }

    const index = locks.indexOf(id);

    if (index < 0) {
        locks = locks.concat(id);
    }
}

export function unlock(id) {
    id = parseInt(id);

    if (isNaN(id)) {
        console.error("Parameter id must be an integer");
        return;
    }

    const index = locks.indexOf(id);

    if (index > -1) {
        locks.splice(index, 1);
    }
}
