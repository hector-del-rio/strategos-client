import "./utils/console"
import fs from "fs";
import macaddress from "macaddress";
import io from 'socket.io-client';
import {receiveTask} from "./controllers/task";
import {cleanUp as cleanUpReports} from "./controllers/report";
import {promisify} from "util"

const readMacAddresses = promisify(macaddress.all);
const {
    STRATEGOS_SERVER_URL,
    STRATEGOS_TLS_KEY,
    STRATEGOS_TLS_CERT,
    STRATEGOS_READ_MAC_INTERVAL,
    STRATEGOS_REPORT_CLEAN_UP_INTERVAL,
} = process.env;

let lastMac = null;
export let socket = null;

// Init app after reading mac addresses from the system
readMacAddresses()
    .then(mac => {
        mac = Object.keys(mac)
            .map(iface => mac[iface].mac)
            .join(',');

        socket = io(
            STRATEGOS_SERVER_URL,
            {
                key: fs.readFileSync(STRATEGOS_TLS_KEY),
                cert: fs.readFileSync(STRATEGOS_TLS_CERT),
                query: {mac},
                rejectUnauthorized: false
            }
        );

        socket.on('connect', (...args) => console.log('CONNECTED', ...args));
        // socket.on('connect_error', (...args) => console.log('CONNECT_ERROR', ...args));
        socket.on('connect_timeout', (...args) => console.log('CONNECT_TIMEOUT', ...args));
        socket.on('reconnect', (...args) => console.log('RECONNECTED', ...args));
        socket.on('reconnect_attempt', (...args) => console.log('RECONNECT_ATTEMPT', ...args));
        socket.on('error', (...args) => console.log('ERROR', ...args));
        socket.on('disconnect', (...args) => console.log('DISCONNECTED', ...args));

        socket.on('task', receiveTask);

        setInterval(updateMacAddresses, STRATEGOS_READ_MAC_INTERVAL);
        setInterval(cleanUpReports, STRATEGOS_REPORT_CLEAN_UP_INTERVAL);
    });


function updateMacAddresses() {
    return readMacAddresses()
        .then(mac => {
            mac = Object.keys(mac)
                .map(iface => mac[iface].mac)
                .join(',');

            if (mac === lastMac) {
                return;
            }

            console.log("A mac address has changed. New mac list: ", mac);

            socket.disconnect();
            socket.io.opts.query.mac = mac;
            socket.connect();

            lastMac = mac;
        });
}



