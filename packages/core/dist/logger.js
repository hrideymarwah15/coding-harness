import pino from "pino";
export function createLogger(level = "info") {
    const isDev = process.env.NODE_ENV !== "production";
    return pino({
        level,
        transport: isDev
            ? {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    ignore: "pid,hostname",
                    translateTime: "HH:MM:ss Z"
                }
            }
            : undefined
    });
}
//# sourceMappingURL=logger.js.map