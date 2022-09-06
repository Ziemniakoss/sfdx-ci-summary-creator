import { existsSync, mkdirSync, promises } from "fs";
import { dirname, join, basename } from "path";

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
  return [a];
}

export async function getProjectRoot(searchStartPath: string): Promise<string> {
  if (existsSync(join(searchStartPath, "sfdx-project.json"))) {
    return searchStartPath;
  }
  return getProjectRoot(dirname(searchStartPath));
}

export async function findFile(
  fileName: string,
  directory?: string
): Promise<string | null> {
  if (directory == null) {
    directory = await getProjectRoot(process.cwd());
  }
  const dirContent = await promises
    .readdir(directory)
    .then((files) => files.map((file) => join(directory, file)));
  const conntentsWithProps = await Promise.all(
    dirContent.map((file) => ({ file, properties: promises.lstat(file) }))
  );
  const dirs = [];
  for (const p of conntentsWithProps) {
    const properties = await p.properties;
    if (properties.isDirectory()) {
      dirs.push(p.file);
    } else if (properties.isFile() && basename(p.file) == fileName) {
      return p.file;
    }
  }

  const foundFilesInSubdirs = await Promise.all(
    dirs.map((dirName) => findFile(fileName, dirName))
  );
  return foundFilesInSubdirs.find((file) => file != null);
}
