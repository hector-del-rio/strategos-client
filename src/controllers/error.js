import * as util from "util";
import {socket} from "../index";

export default function emit(error) {
    console.error(error);
    const errorString = util.inspect(error);
    socket.emit('client-error', errorString);
}