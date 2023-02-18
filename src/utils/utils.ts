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

async function getProjectDirectories(): Promise<string[]> {
    const rootProjectDirectory = await getProjectRoot(process.cwd());
    return promises
        .readFile(join(rootProjectDirectory, "sfdx-project.json"), "utf-8")
        .then(JSON.parse)
        .then((projectDefinition) => {
            return projectDefinition.packageDirectories.map((projectDir) =>
                join(rootProjectDirectory, projectDir.path)
            );
        });
}

/**
 * In normal SFDX command, we would have project object which has fast
 * project directories discovery. Because we are working from level of hook,
 * we need to cache this promise to speed up process (basically we are looking
 * for project directories only once)
 */
let sharedProjectDirectoriesDiscoveryPromise: Promise<string[]>;
export async function findFile(fileName: string): Promise<string | null> {
    if (sharedProjectDirectoriesDiscoveryPromise == null) {
        sharedProjectDirectoriesDiscoveryPromise = getProjectDirectories();
    }
    const projectDirectories = await sharedProjectDirectoriesDiscoveryPromise;
    for (const projectDir of projectDirectories) {
        const foundFileInDir = await findFileInDirectory(fileName, projectDir);
        if (foundFileInDir != null) {
            return foundFileInDir;
        }
    }
    return null;
}

async function findFileInDirectory(fileName: string, directory: string): Promise<string | null> {
    const dirContent = await promises.readdir(directory).then((files) => files.map((file) => join(directory, file)));
    const contentsWithProps = await Promise.all(dirContent.map((file) => ({ file, properties: promises.lstat(file) })));
    const dirs = [];
    for (const p of contentsWithProps) {
        const properties = await p.properties;
        if (properties.isDirectory()) {
            dirs.push(p.file);
        } else if (properties.isFile() && basename(p.file) == fileName) {
            return p.file;
        }
    }

    const foundFilesInSubdirs = await Promise.all(dirs.map((dirName) => findFileInDirectory(fileName, dirName)));
    return foundFilesInSubdirs.find((file) => file != null);
}
