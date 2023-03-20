import { existsSync, mkdirSync, promises } from "fs";
import { dirname, join, relative } from "path";
import { getPathFromIndex } from "./metadataIndex";
import { FILE_EXTENSIONS } from "./constants";

const PROJECT_DEFINITION_FILE_NAME = "sfdx-project.json";

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
        .readFile(join(rootProjectDirectory, PROJECT_DEFINITION_FILE_NAME), "utf-8")
        .then(JSON.parse)
        .then((projectDefinition) => {
            return projectDefinition.packageDirectories.map((projectDir) =>
                join(rootProjectDirectory, projectDir.path)
            );
        });
}

export async function formatStackTrace(stackTrace: string) {
    if (stackTrace == null) {
        return "";
    }
    const stackEntries = stackTrace.replace("\n\r", "\n").split("\n");
    const stack = await Promise.all(stackEntries.map((entry) => formatStackEntry(entry))).then((formattedEntries) =>
        formattedEntries.join("\n")
    );
    return "\n" + stack;
}

const INDENT = "        ";

async function formatStackEntry(stackEntry: string): Promise<string> {
    stackEntry = stackEntry.trim();
    if (!stackEntry.startsWith("Class.")) {
        return `${INDENT}${stackEntry}`;
    }

    const [fullEntityName, _empty1, _line, lineNumber] = stackEntry.replace(",", " ").replace(":", " ").split(" ");
    const [_entityType, entityName, method] = fullEntityName.split(".");
    const nameInIndex = `${entityName}.${FILE_EXTENSIONS.APEX_CLASS}`;
    const path = await getPathFromIndex(nameInIndex);
    if (path != null) {
        const relativePath = relative(process.cwd(), path);
        return `${INDENT}${relativePath}:${lineNumber} in method ${method}`;
    }
    return `${INDENT}${stackEntry}`;
}
