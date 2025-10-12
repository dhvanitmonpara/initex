import { consola } from "consola";

type LocalLogFn = typeof consola.log;

export const logInfo: LocalLogFn = consola.info;
export const logSuccess: LocalLogFn = consola.success;
export const logError: LocalLogFn = consola.error;
