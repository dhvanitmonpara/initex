import {
  confirm,
  isCancel,
  multiselect,
  type Option,
  select,
  text,
} from "@clack/prompts";
import { consola } from "consola";

async function prompt<T>(fn: () => Promise<T>): Promise<T> {
  const result = await fn();
  if (isCancel(result)) {
    consola.warn("Operation cancelled.");
    process.exit(0);
  }
  return result as T;
}

async function promptText(
  message: string,
  placeholder?: string,
  initialValue?: string,
  validate?: (v: string) => string | undefined
) {
  return (await prompt(() =>
    text({ message, placeholder, initialValue, validate })
  )) as string;
}

async function promptSelect<T>(
  message: string,
  options: Option<T>[]
): Promise<T> {
  return (await prompt(() => select({ message, options }))) as T;
}

async function promptMultiSelect<T>(
  message: string,
  options: Option<T>[],
  initialValue?: T[]
): Promise<T[]> {
  return (await prompt(() =>
    multiselect({
      message,
      options,
      required: true,
      initialValues: initialValue,
    })
  )) as T[];
}

async function promptConfirm(message: string, initialValue = false) {
  return (await prompt(() => confirm({ message, initialValue }))) as boolean;
}

export { promptConfirm, promptSelect, prompt, promptText, promptMultiSelect };
