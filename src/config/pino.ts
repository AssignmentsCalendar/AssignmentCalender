import pino, { P } from "pino";

const loggerOptions: P.LoggerOptions = {
    level: "info",
    transport: {
        target: "pino-pretty",
        options: {colorize: true, ignore: "pid,hostname", dateFormat: "yyyy-mm-dd HH:MM:ss"}
    }
}

export const logger = pino(loggerOptions);