import { Builder } from "xml2js";
import { promises } from "fs";
import {dirname} from "path";
import {DeploymentResult} from "../dataTypes/deployment";
import {ReportGenerator} from "./ReportGenerator";
import {mkdirs, wrapInArray} from "../utils/utils";

export default class MarkdownDeploymentSummaryCreator implements ReportGenerator{
    async createReport(deployment: DeploymentResult, writeToDisc = true): Promise<string> {
        const reportGenerationPromises:Promise<string>[]= [
            this.createDeploymentSummary(deployment)
        ]
        if(deployment.details.componentFailures.length == 0) {
            reportGenerationPromises.push(this.createTestRunReport(deployment))
        }
        if(deployment.details.runTestResult.codeCoverage.length > 0) {
            reportGenerationPromises.push(this.createCoverageReport(deployment))
        }
        const report =await Promise.all(reportGenerationPromises).then(reportParts => reportParts.join("\n\n"))

        if(writeToDisc) {
            const outputPath = this.getOutputFile()
            await  mkdirs(dirname(outputPath))
            await promises.writeFile(outputPath, report)
        }
        return report
    }

    private getOutputFile() {
        let outputFile = "deployment_report.md";
        if (
            process.env["GITHUB_STEP_SUMMARY"] != null &&
            process.env["GITHUB_STEP_SUMMARY"] != ""
        ) {
            outputFile = process.env["GITHUB_STEP_SUMMARY"];
        } else if (
            process.env["CI_SUMMARY_MD_DEPLOYMENT_REPORT_OUTPUT"] != null &&
            process.env["CI_SUMMARY_MD_DEPLOYMENT_REPORT_OUTPUT"] != ""
        ) {
            outputFile = process.env["CI_SUMMARY_MD_DEPLOYMENT_REPORT_OUTPUT"];
        }
        return outputFile
    }

    private async createDeploymentSummary(deploymentResult: DeploymentResult): Promise<string >{
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
                    failure.componentType ?? "",
                    failure.fullName ?? "",
                    failure.lineNumber ?? "",
                    failure.problem ?? "",
                ],
            });
        }
        const tableAsXml = new Builder().buildObject({ table });
        return `# ${FAILURE_EMOJI} Components deployment\n\n${failures.length} components couldn't be deployed\n\n${tableAsXml}`;
    }

    private async createTestRunReport(deploymentResult: DeploymentResult): Promise<string>{
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

    private createTestRunFailuresReport(deployemntResult: DeploymentResult): string {
        let report = "";
        for (const failure of wrapInArray(deployemntResult.details.runTestResult.failures)) {
            const testCaseName = `${failure.name}.${failure.methodName}`;
            report += `## ${testCaseName}\n\n${failure.message}\n\n`;
            if (failure.stackTrace) {
                const summary = {
                    details: {
                        summary: "Stack trace",
                        pre: failure.stackTrace,
                    },
                };
                report += `\n\n${new Builder().buildObject(summary)}\n\n`;
            }
        }
        return report;
    }

    private async  createCoverageReport(deploymentResult: DeploymentResult): Promise<string >{
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
        const coverages = wrapInArray(deploymentResult.details.runTestResult.codeCoverage).sort(
            (first, second) => first.name.localeCompare(second.name)
        );
        for (const coverage of coverages) {
            const className = coverage.name;
            //@ts-ignore
            const locationsCount = parseInt(coverage.numLocations);
            //@ts-ignore
            const locationsNotCoveredCount = parseInt(coverage.numLocationsNotCovered);
            let coveragePercent = 100;
            if (locationsCount != 0) {
                coveragePercent = Math.ceil(
                    (100.0 * (locationsCount - locationsNotCoveredCount)) / locationsCount
                );
            }
            let coverageTestColor = "green";
            if (coveragePercent < minimumCodeCoverage) {
                allPassedCoverageRequirement = false;
                coverageTestColor = "red";
            }
            const linesNotCovered = wrapInArray(coverage.locationsNotCovered)
                .map((c) => c.line)
                .join(",");
            rows.push({
                th: className,
                td: [
                    {
                        $: {
                            style: `color: ${coverageTestColor}`,
                        },
                        _: `${coveragePercent}%`,
                    },
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
