import logger from "@/core/logger";
import morgan from "morgan";
import { Request } from "express";

const SKIP_SUFFIXES = ["/healthz", "/readyz"];

morgan.token("id", (req: Request) => req.id ?? "no-id");
morgan.token("remoteAddr", (req: Request) => req.ip);

const morganStream = {
  write: (message: string) => {
    setImmediate(() => {
      try {
        logger.http(JSON.parse(message.trim()));
      } catch {
        logger.http(message.trim());
      }
    });
  }
};

export const registerRequestLogging = morgan(
  (tokens, req, res) =>
    JSON.stringify({
      requestId: tokens.id(req, res),
      ip: tokens.remoteAddr(req, res),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      responseTimeMs: Number(tokens["response-time"](req, res)),
    }),
  {
    stream: morganStream,
    skip: (req: Request) =>
      req.method === "HEAD" ||
      (req.path.startsWith("/api/") &&
        SKIP_SUFFIXES.some((suffix) => req.path.endsWith(suffix))),
  }
);
