import { Builder } from "xml2js";
import { DeploymentResult } from "./dataTypes/deployment";
import { promises } from "fs";
import { wrapInArray } from "./utils/utils";

export default class MarkdownDeploymentSummaryCreator {
  async createSummary(deploymentResult: DeploymentResult) {
    const outputFile =
      process.env["CI_SUMMARY_MD_DEPLOYMENT_REPORT_OUTPUT"] ??
      "deployment_report.md";
    await promises.writeFile(
      outputFile,
      this.createDeploymentSummary(deploymentResult)
    );

    if (wrapInArray(deploymentResult.details.componentFailures).length != 0) {
      return;
    }
    return promises
      .appendFile(outputFile, this.createTestRunReport(deploymentResult))
      .then(() =>
        promises.appendFile(
          outputFile,
          this.createCoverageReport(deploymentResult)
        )
      );
  }

  private createDeploymentSummary(deploymentResult: DeploymentResult): string {
    const failures = wrapInArray(deploymentResult.details.componentFailures);

    if (failures.length == 0) {
      return `# ${SUCCESS_MARK} Components deployment\n\nAll components were successfully deployed\n\n`;
    }
    const table = {
      thead: {
        tr: {
          th: ["Component type", "Component name", "Line", "Error message"],
        },
      },
      tbody: {
        tr: [],
      },
    };
    const rows = table.tbody.tr;
    for (const failure of failures) {
      rows.push({
        td: [
          failure.componentType,
          failure.fullName,
          failure.lineNumber,
          failure.problem,
        ],
      });
    }
    const tableAsXml = new Builder().buildObject({ table });
    return `# ${FAILURE_EMOJI} Components deployment\n\n${failures.length} components couldn't be deployed\n\n${tableAsXml}`;
  }

  private createTestRunReport(deploymentResult: DeploymentResult): string {
    const failuresCount = deploymentResult.details.runTestResult.numFailures;
    if (failuresCount == 0) {
      return `# ${SUCCESS_MARK} Test run summary\n\nAll tests passed\n\n`;
    }
    const testsCount = deploymentResult.details.runTestResult.numTestsRun;
    let report = `# ${FAILURE_EMOJI} Test run summary\n\n${failuresCount} out of ${testsCount} failed\n\n`;
    if (failuresCount > 0) {
      report += this.createTestRunFailuresReport(deploymentResult) + "\n\n";
    }
    return report;
  }

  private createTestRunFailuresReport(
    deployemntResult: DeploymentResult
  ): string {
    let report = "";
    for (const failure of wrapInArray(
      deployemntResult.details.runTestResult.failures
    )) {
      const testCaseName = `${failure.name}.${failure.methodName}`;
      const summary = {
        details: {
          summary: "Stack trace",
          pre: failure.stackTrace,
        },
      };
      report += `## ${testCaseName}\n\n${
        failure.message
      }\n\n${new Builder().buildObject(summary)}\n\n`;
    }
    return report;
  }

  private createCoverageReport(deploymentResult: DeploymentResult): string {
    const table = {
      thead: {
        tr: {
          th: ["Class", "Coverage", "Not covered lines"],
        },
      },
      tbody: {
        tr: [],
      },
    };
    const rows = table.tbody.tr;
    let allPassedCoverageRequirement = true;
    let minimumCodeCoverage = parseInt(
      process.env["CI_SUMMARY_MD_DEPLOYMENT_REPORT_MIN_COVERAGE"]
    );
    if (isNaN(minimumCodeCoverage)) {
      minimumCodeCoverage = 75;
    }
    console.log(minimumCodeCoverage);
    for (const coverage of wrapInArray(
      deploymentResult.details.runTestResult?.codeCoverage
    )) {
      const className = coverage.name;
      //@ts-ignore
      const locationsCount = parseInt(coverage.numLocations);
      //@ts-ignore
      const locationsNotCoveredCount = parseInt(
        coverage.numLocationsNotCovered
      );
      const coveragePercent = Math.ceil(
        (100.0 * (locationsCount - locationsNotCoveredCount)) / locationsCount
      );
      if (coveragePercent < minimumCodeCoverage) {
        allPassedCoverageRequirement = false;
      }
      const linesNotCovered = wrapInArray(coverage.locationsNotCovered)
        .map((c) => c.line)
        .join(",");
      rows.push({
        th: className,
        td: [
          //@ts-ignore
          `${coveragePercent}%`,
          linesNotCovered,
        ],
      });
    }

    const tt = new Builder().buildObject({ table });
    const emoji = allPassedCoverageRequirement ? SUCCESS_MARK : FAILURE_EMOJI;
    return `# ${emoji} Coverage report\n\n${tt}`;
  }
}

const SUCCESS_MARK = "✓";
const FAILURE_EMOJI = "✖";
