import { ReportGenerator } from "./ReportGenerator";
import { DeploymentResult, RunTestFailure, RunTestSuccess } from "../dataTypes/deployment";
import * as constants from "constants";

const chalk = require("chalk");

const SUCCESS_SYMBOL = "✓";
const FAILURE_SYMBOL = "X";
/**
 * Prints readable (unlike this tAblEs shit that sfdx prints out) output to console
 */
export default class ReadableConsoleReport implements ReportGenerator {
    /**
     * @param deployment
     * @param writeToDisc should report be printed to stdio
     */
    async createReport(deployment: DeploymentResult, writeToDisc = true): Promise<string> {
        const report = await Promise.all([
            this.getReportHeader(),
            this.createDeploymentSection(deployment),
            this.createTestExecutionSection(deployment),
            this.createCoverageSection(deployment),
            this.createCodeCoverageWarningsSection(deployment),
            this.getReportFooter(),
        ]).then((sections) => sections.filter((section) => section != "").join("\n\n"));
        if (writeToDisc) {
            console.log(report);
        }
        return report;
    }

    private async getReportHeader() {
        return "==== START OF PRETTY REPORT ====";
    }

    private async getReportFooter() {
        return "====  END OF PRETTY REPORT  ====";
    }

    private async createDeploymentSection(deployment: DeploymentResult): Promise<string> {
        const header = chalk.bold("Deployment\n");
        if (deployment.details.componentFailures.length == 0) {
            return header + `  ${deployment.details.componentSuccesses.length} components deployed successfully`;
        }
        const formattedErrorMessages = deployment.details.componentFailures.map((failure) => {
            let formattedComponentName = chalk.red(failure.fileName);
            if (failure.lineNumber != null) {
                formattedComponentName += chalk.red(`:${failure.lineNumber}`);
                if (failure.columnNumber != null) {
                    formattedComponentName += chalk.red(`:${failure.columnNumber}`);
                }
            }
            return `${formattedComponentName}: ${failure.problem}`;
        });
        return header + formattedErrorMessages.join("\n");

        return header;
    }

    private async createTestExecutionSection(deployment: DeploymentResult): Promise<string> {
        const testRunInfo = deployment.details.runTestResult;
        if (testRunInfo.numTestsRun == 0) {
            return "";
        }
        const header = chalk.bold("Test Execution\n");
        const classNameToFailures = new Map<string, RunTestFailure[]>();
        const classNameToSuccesses = new Map<string, RunTestSuccess[]>();
        const classNames = new Set<string>();
        for (const failure of testRunInfo.failures) {
            let classFailures = classNameToFailures.get(failure.name);
            if (classFailures == null) {
                classFailures = [];
                classNameToFailures.set(failure.name, classFailures);
            }
            classFailures.push(failure);
            classNames.add(failure.name);
        }
        for (const success of testRunInfo.successes) {
            let classSuccesses = classNameToSuccesses.get(success.name);
            if (classSuccesses == null) {
                classSuccesses = [];
                classNameToSuccesses.set(success.name, classSuccesses);
            }
            classSuccesses.push(success);
            classNames.add(success.name);
        }

        let report = "";
        for (const className of classNames) {
            const successes = classNameToSuccesses.get(className) ?? [];
            const failures = classNameToFailures.get(className) ?? [];

            const formattedMessages = [];

            let totalTime = 0;
            failures.forEach((failure) => {
                const formattedMethodInfo = chalk.red(
                    `    ${FAILURE_SYMBOL} ${failure.methodName} (${failure.time}ms): `
                );
                const additionalInfo = `${failure.message}\n${this.formatStackTrace(failure.stackTrace)}`;
                formattedMessages.push(formattedMethodInfo + additionalInfo);
                totalTime += failure.time;
            });
            successes.forEach((success) => {
                const formattedMessage = chalk.green(`    ${SUCCESS_SYMBOL} ${success.methodName} (${success.time}ms)`);
                formattedMessages.push(formattedMessage);
                // @ts-ignore
                totalTime += success.time;
            });
            let classHeader;
            if (failures.length == 0) {
                classHeader = chalk.green(`  ${className} (${totalTime}ms)\n`);
            } else {
                classHeader = chalk.red(`  ${className} (${totalTime}ms)\n`);
            }
            report += classHeader + formattedMessages.join("\n") + "\n";
        }
        return header + report;
    }

    private formatStackTrace(stackTrace: string): string {
        if (stackTrace == null) {
            return "";
        }
        return (
            "\n" +
            stackTrace
                .replace("\n\r", "\n")
                .split("\n")
                .map((stackEntry) => `        ${stackEntry}`)
                .join("\n")
        );
    }

    private async createCoverageSection(deployment: DeploymentResult): Promise<string> {
        const codeCoverageData = deployment.details.runTestResult.codeCoverage;
        if (codeCoverageData.length == 0) {
            return "";
        }
        const header = chalk.bold("Code Coverage\n");

        return (
            header +
            codeCoverageData
                .map((coverageData) => {
                    let coveredPercentage = 100;
                    if (coverageData.numLocations != 0) {
                        coveredPercentage =
                            ((coverageData.numLocations - coverageData.numLocationsNotCovered) /
                                coverageData.numLocations) *
                            100;
                    }
                    coveredPercentage = Math.ceil(coveredPercentage);
                    let coverageMessage;
                    if (coveredPercentage == 75) {
                        coverageMessage = chalk.yellow("75%");
                    } else if (coveredPercentage < 75) {
                        coverageMessage = chalk.red(`${coveredPercentage}%`);
                    } else {
                        coverageMessage = chalk.green(`${coveredPercentage}%`);
                    }
                    return `  ${coverageData.name}: ${coverageMessage}`;
                })
                .join("\n")
        );
    }

    private async createCodeCoverageWarningsSection(deployment: DeploymentResult): Promise<string> {
        const codeCoverageWarnings = deployment.details.runTestResult.codeCoverageWarnings;
        if (codeCoverageWarnings.length == 0) {
            return "";
        }
        const header = chalk.bold("Code Coverage Warnings\n");
        return (
            header +
            codeCoverageWarnings.map((warning) => {
                if (warning.name != null) {
                    return `  - ${warning.name}: ${warning.message}`;
                }
                return `  - ${warning.message}`;
            })
        );
    }
}
