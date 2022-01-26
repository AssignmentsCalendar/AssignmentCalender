import pino, { P } from "pino";

const loggerOptions: P.LoggerOptions = {
    level: "info",
    transport: {
        targets: [
            {level: "info", target: "pino-pretty", options: {colorize: true, ignore: "pid,hostname", translateTime: "SYS:HH:MM:ss Z"}},
            {level: "info", target: "pino-pretty", options: {colorize: false, destination: "public/log/pino.log", mkdir: true, singleLine: true, translateTime: "yyyy-mm-dd HH:MM:ss Z"}}
        ]
    }
}

export const logger = pino(loggerOptions);