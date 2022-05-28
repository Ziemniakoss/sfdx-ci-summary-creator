import { DeploymentResult } from "./dataTypes/deployment";
import { Builder } from "xml2js";
import { mkdirs, wrapInArray } from "./utils/utils";
import * as path from "path";
import { dirname } from "path";
import { promises } from "fs";
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

const VAR_WITH_OUTPUT_PATH = "CI_SUMMARY_JUNIT_SUMMARY_OUTPUT_PATH";

export default class JUnitDeploymentSummaryCreator {
  private getOutputFile(): string {
    if (process.env[VAR_WITH_OUTPUT_PATH] != null) {
      return process.env[VAR_WITH_OUTPUT_PATH];
    }
    return path.join("test-results", "sfdx-deployment.xml");
  }
  async createSummary(deploymentResult: DeploymentResult) {
    const report: JUnitReport = {
      testsuites: {
        testsuite: await Promise.all([
          this.createTestRunTestSuite(deploymentResult),
          this.createDeploymentTestSuite(deploymentResult),
        ]),
      },
    };
    const reportAsXml = new Builder({ cdata: true }).buildObject(report);
    const outputPath = this.getOutputFile();
    mkdirs(dirname(outputPath));
    return promises.writeFile(outputPath, reportAsXml);
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
    for (const failure of wrapInArray(testCases.failures)) {
      const caseForFailure: TestCase = {
        $: {
          classname: failure.name,
          name: failure.methodName,
        },
        failure: [
          {
            $: {
              message: failure.message,
            },
            _: failure.stackTrace,
          },
        ],
      };
      testSuite.testcase.push(caseForFailure);
    }
    return testSuite;
  }
}
