import pino, { P } from "pino";

const loggerOptions: P.LoggerOptions = {
    level: "info",
    transport: {
        target: "pino-pretty",
        options: {colorize: true, ignore: "pid,hostname", translateTime: "SYS:HH:MM:ss Z"}
    }
}

export const logger = pino(loggerOptions);