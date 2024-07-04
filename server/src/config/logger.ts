import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize } = format;

// Define the log format
const logger = (filename: string) => createLogger({
  format: format.combine(
    format.label({ label: filename }),
    format.timestamp(),
    format.printf(({ timestamp, label, level, message }) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/info.log", level: "info" }),
    new transports.File({ filename: "logs/debug.log", level: "debug" }),
    new transports.File({ filename: "logs/server.log" }),
  ],
});

export default logger;
