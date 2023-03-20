import { promises } from "fs";
import { join, dirname } from "path";
import { ReportGenerator } from "./ReportGenerator";
import { CodeCoverageResult, DeploymentResult } from "../dataTypes/deployment";
import { getProjectRoot, mkdirs, wrapInArray } from "../utils/utils";
import Environment from "../utils/Environment";
import {ENV_VARS_NAMES, FILE_EXTENSIONS, METADATA_TYPES} from "../utils/constants";
import {getPathFromIndex} from "../utils/metadataIndex";

interface SourceFile {
    name: string;
    coverage: (number | null)[];
}

interface CoverallsReport {
    source_files: SourceFile[];
    service_name: string;
    repo_token?: string;
}

export default class CoverallsCoverageReportCreator extends ReportGenerator {
    shouldBeDisabled(): boolean {
        return this.env.getBooleanVar(ENV_VARS_NAMES.COVERALLS.DISABLED);
    }
    constructor(private env: Environment) {
        super();
    }

    async createReport(deployment: DeploymentResult, writeToDisc = true): Promise<string> {
        const sourceFiles = await Promise.all(
            deployment.details.runTestResult.codeCoverage.map((fileCoverage) =>
                this.createSourceFileSummary(fileCoverage)
            )
        );
        const report: CoverallsReport = {
            service_name: "sfdx-ci-summary-creator",
            source_files: sourceFiles,
        };
        const reportAsString = JSON.stringify(report);
        if (writeToDisc) {
            const outputPath =
                this.env.getVar(ENV_VARS_NAMES.COVERALLS.LOCATION) ??
                join(await getProjectRoot(process.cwd()), "deployment_reports", "coveralls.json");
            await mkdirs(dirname(outputPath));
            await promises.writeFile(outputPath, JSON.stringify(report));
        }
        return reportAsString;
    }

    private async createSourceFileSummary(fileCodeCoverage: CodeCoverageResult): Promise<SourceFile> {
        const notCoveredLines = new Set<number>();
        //@ts-ignore
        let greatestLineNumber = parseInt(fileCodeCoverage.numLocations);
        for (const lineCoverage of wrapInArray(fileCodeCoverage.locationsNotCovered)) {
            // @ts-ignore
            const lineNumber = parseInt(lineCoverage.line);
            notCoveredLines.add(lineNumber);
            greatestLineNumber = Math.max(greatestLineNumber, lineNumber);
        }

        let linesToMarkAsCovered = fileCodeCoverage.numLocations - fileCodeCoverage.numLocationsNotCovered;
        const coverage = [];
        for (let i = 1; i <= greatestLineNumber; i++) {
            if (notCoveredLines.has(i)) {
                coverage.push(0);
            } else if (linesToMarkAsCovered > 0) {
                coverage.push(1);
                linesToMarkAsCovered--;
            } else {
                coverage.push(null);
            }
        }
        let filePath;
        let fileToFind;
        if (fileCodeCoverage.type == METADATA_TYPES.APEX_CLASS) {
            fileToFind = `${fileCodeCoverage.name}.${FILE_EXTENSIONS.APEX_CLASS}`;
            filePath = await getPathFromIndex(fileToFind)
        } else if (fileCodeCoverage.type == METADATA_TYPES.APEX_TRIGGER) {
            fileToFind = `${fileCodeCoverage.name}.${FILE_EXTENSIONS.APEX_TRIGGER}`;
            filePath = await getPathFromIndex(fileToFind)
        } else {
            fileToFind = `${fileCodeCoverage.type}/${fileCodeCoverage.name}`;
        }
        return {
            name: filePath ?? fileToFind,
            coverage,
        };
    }
}
