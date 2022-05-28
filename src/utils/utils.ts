import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

export function mkdirs(path: string) {
  const parentDir = dirname(path);
  if (!existsSync(parentDir)) {
    mkdirs(parentDir);
  }
  if (!existsSync(path)) {
    mkdirSync(path);
  }
}

export function wrapInArray(a) {
  if (a == null) {
    return [];
  }
  if (Array.isArray(a)) {
    return a;
  }
  return a;
}
