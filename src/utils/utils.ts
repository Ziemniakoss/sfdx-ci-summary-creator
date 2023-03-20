import {existsSync, mkdirSync, promises} from "fs";
import {dirname, join,} from "path";

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

export async function getProjectDirectories(): Promise<string[]> {
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

export async function formatStackTrace(stackTrace:string) {
    co

}
