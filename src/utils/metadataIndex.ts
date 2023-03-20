import { getProjectDirectories } from "./utils";
import { promises } from "fs";
import { basename, join } from "path";

/**
 * @file Index of Salesforce metadata.
 * Used to shorted code coverage report generation time.
 * Currently only Apex files are indexed
 */
const INDEX: Record<string, string> = {};
let indexingPromise = indexFiles();

async function indexFiles() {
    const projectDirectories = await getProjectDirectories();
    const projectDirectoriesIndexingPromises = projectDirectories.map((dir) => indexFolder(dir));
    return Promise.all(projectDirectoriesIndexingPromises);
}

async function indexFolder(folder: string) {
    const dirContents: { fileOrDir: string; stats }[] = await promises
        .readdir(folder)
        .then((contents) => {
            const fileDataGettingPromises = contents.map(async (fileOrDir) => {
                try {
                    const stats = await promises.lstat(join(folder, fileOrDir));
                    return { fileOrDir, stats };
                } catch (e) {
                    return null;
                }
            });
            return Promise.all(fileDataGettingPromises);
        })
        .then((results) => results.filter((r) => r != null));
    const subFoldersIndexingPromises: Promise<any>[] = [];
    for (const fileOrDir of dirContents) {
        const fullPath = join(folder, fileOrDir.fileOrDir);
        if (fileOrDir.stats.isDirectory()) {
            subFoldersIndexingPromises.push(indexFolder(fullPath));
        } else if (fileOrDir.stats.isFile() && shouldBeIndexed(fileOrDir.fileOrDir)) {
            const metadataName = basename(fileOrDir.fileOrDir).toLowerCase();
            INDEX[metadataName] = fullPath;
        }
    }
    return Promise.all(subFoldersIndexingPromises);
}

function shouldBeIndexed(path: string) {
    return path.endsWith(".cls") || path.endsWith(".trigger");
}

/**
 * Used to start indexing files
 */
export async function startIndexing() {
    return indexingPromise;
}

/**
 *
 * @param classOrTriggerName
 */
export async function getPathFromIndex(classOrTriggerName: string): Promise<string | null> {
    await indexingPromise;
    return INDEX[classOrTriggerName.toLowerCase()];
}
