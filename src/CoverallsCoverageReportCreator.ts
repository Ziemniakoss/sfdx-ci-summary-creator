import { CodeCoverageResult, DeploymentResult } from "./dataTypes/deployment";
import { findFile, getProjectRoot, mkdirs, wrapInArray } from "./utils/utils";
import { promises } from "fs";
import { join, dirname } from "path";

interface SourceFile {
  name: string;
  coverage: (number | null)[];
}

interface CoverallsReport {
  source_files: SourceFile[];
  service_name: string;
  repo_token?: string;
}
const ENV_REPORT_DIR = "CI_SUMMARY_COVERALLS_LOCATION";

export default class CoverallsCoverageReportCreator {
  async createSummary(deploymentResult: DeploymentResult) {
    const coverage:CodeCoverageResult[] = wrapInArray(
      deploymentResult?.details?.runTestResult?.codeCoverage
    );

    const sourceFiles = await Promise.all(
      coverage.map((fileCoverage) => this.createSourceFileSummary(fileCoverage))
    );
    const report: CoverallsReport = {
      service_name: "sfdx-ci-summary-creator",
      source_files: sourceFiles,
    };
    const outputPath =
      process.env[ENV_REPORT_DIR] ??
      join(
        await getProjectRoot(process.cwd()),
        "deployment_reports",
        "coveralls.json"
      );
    await mkdirs(dirname(outputPath));
    return promises.writeFile(outputPath, JSON.stringify(report, null, 4));
  }

  private async createSourceFileSummary(
    fileCodeCoverage: CodeCoverageResult
  ): Promise<SourceFile> {
    const notCoveredLines = new Set<number>();
    //@ts-ignore
    let greatestLineNumber = parseInt(fileCodeCoverage.numLocations ?? 6);
    for (const lineCoverage of wrapInArray(
      fileCodeCoverage.locationsNotCovered
    )) {
      // @ts-ignore
      const lineNumber = parseInt(lineCoverage.line);
      notCoveredLines.add(lineNumber);
      greatestLineNumber = Math.max(greatestLineNumber, lineNumber);
    }

    let linesToMarkAsCovered =
      parseInt(fileCodeCoverage.numLocations) -
      parseInt(fileCodeCoverage.numLocationsNotCovered);
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
    if (fileCodeCoverage.type == "Class") {
      fileToFind = `${fileCodeCoverage.name}.cls`;
      filePath = await findFile(fileToFind);
    } else if (fileCodeCoverage.type == "Trigger") {
      fileToFind = `${fileCodeCoverage.name}.trigger`;
      filePath = await findFile(fileToFind);
    } else {
      fileToFind = `${fileCodeCoverage.type}/${fileCodeCoverage.name}`;
    }
    return {
      name: filePath ?? fileToFind,
      coverage,
    };
  }
}
