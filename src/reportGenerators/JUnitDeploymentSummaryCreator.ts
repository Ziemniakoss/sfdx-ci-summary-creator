import {Builder} from "xml2js";
import * as path from "path";
import {dirname} from "path";
import {promises} from "fs";
import {DeploymentResult} from "../dataTypes/deployment";
import {mkdirs, wrapInArray} from "../utils/utils";
import {ENV_VARS_NAMES} from "../utils/constants";
import Environment from "../utils/Environment";
import {ReportGenerator} from "./ReportGenerator";
import {isDependentClassNeedsRecompilationError, prepareRunTestFailureMessage} from "../utils/formattingUtils";

interface TestCase {
	$: {
		classname: string;
		name: string;
	};
	failure: [
		{
			$: {
				message: string;
			};
			_?: string;
		}
	];
}

interface TestSuite {
	$: {
		name: string;
		tests: number | string;
		failures: number | string;
	};
	testcase: TestCase[];
}

interface JUnitReport {
	testsuites: {
		testsuite: TestSuite[];
	};
}

export default class JUnitDeploymentSummaryCreator implements ReportGenerator {
	constructor(private env: Environment) {
	}

	private getOutputFile(): string {
		const varNameWithLocation = ENV_VARS_NAMES.JUNIT_REPORT.LOCATION
		if (this.env.getVar(varNameWithLocation) != null) {
			return this.env.getVar(varNameWithLocation)
		}
		return path.join("test-results", "sfdx-deployment.xml");
	}

	async createReport(deploymentResult: DeploymentResult,writeToDisc=true): Promise<string> {
		const report: JUnitReport = {
			testsuites: {
				testsuite: await Promise.all([
					this.createTestRunTestSuite(deploymentResult),
					this.createDeploymentTestSuite(deploymentResult),
				]),
			},
		};
		const reportAsXml: string = new Builder({cdata: true}).buildObject(report);
		if(writeToDisc) {
			const outputPath = this.getOutputFile();
			mkdirs(dirname(outputPath));
			await promises.writeFile(outputPath, reportAsXml)
		}
		return reportAsXml
	}

	private createDeploymentTestSuite(
		deploymentResult: DeploymentResult
	): TestSuite {
		const failures = wrapInArray(deploymentResult.details.componentFailures);
		const failuresCount = failures.length;
		const successesCount =
			deploymentResult.details.componentSuccesses?.length ?? 0;
		const testSuite: TestSuite = {
			$: {
				name: "Deployment",
				tests: failuresCount + successesCount,
				failures: failuresCount,
			},
			testcase: [],
		};
		for (const failure of failures) {
			const message = `${failure.fileName}:${failure.lineNumber}: ${failure.problem}`;
			const caseForFailure: TestCase = {
				$: {
					name: failure.fullName,
					classname: failure.componentType,
				},
				failure: [
					{
						$: {
							message,
						},
					},
				],
			};
			testSuite.testcase.push(caseForFailure);
		}
		return testSuite;
	}

	private createTestRunTestSuite(
		deploymentResult: DeploymentResult
	): TestSuite {
		const testCases = deploymentResult.details.runTestResult;
		const testSuite: TestSuite = {
			$: {
				name: "Apex unit tests",
				tests: testCases.numTestsRun,
				failures: testCases.numFailures,
			},
			testcase: [],
		};
		let failures = wrapInArray(testCases.failures)
		if(this.env.getVar(ENV_VARS_NAMES.JUNIT_REPORT.FILTER_TEST_FAILURES_DUE_TO_DEPENDENT_CLASSES) == "true") {
			failures = failures.filter(failure => !isDependentClassNeedsRecompilationError(failure.message))
		}
		for (const failure of failures) {
			const caseForFailure: TestCase = {
				$: {
					classname: failure.name,
					name: failure.methodName,
				},
				failure: [
					{
						$: {
							message: prepareRunTestFailureMessage(failure.message, deploymentResult)
						},
						_: failure.stackTrace ?? failure.message ?? "JSFORCE parsing error, please file issue in repo of sfdx-ci-summary-creator plugin",
					},
				],
			};
			if(failure.methodName != null) {

			}
			testSuite.testcase.push(caseForFailure);
		}
		return testSuite;
	}
}

