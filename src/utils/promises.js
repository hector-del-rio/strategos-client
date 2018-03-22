import * as fs from "fs";

export function promiseCreateWriteStream(path) {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(path);
        writeStream.on('open', (fd) => resolve({fd, writeStream}));
        writeStream.on('error', reject);
    })
}
