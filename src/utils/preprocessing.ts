import { DeploymentResult, DeployMessage } from "../dataTypes/deployment";
import { wrapInArray } from "./utils";

/**
 * Standardizes deployment result.
 * Sometimes, JsForce converts:
 * - empty arrays to nulls
 * - arrays with single element to objects
 *
 * This can cause unexpected errors while generating proper reports
 *
 * @param deploymentResult original report. This object won't be modified
 * @param deleteDependentClassNeedsRecompilationErrors should errors caused by dependent
 * classes be deleted. Setting this to true significantly increases readability of deployment
 * error
 */
export function preprocess(deploymentResult: DeploymentResult, deleteDependentClassNeedsRecompilationErrors: boolean) {
    const copy: DeploymentResult = JSON.parse(JSON.stringify(deploymentResult));
    copy.details.componentFailures = wrapInArray(copy.details.componentFailures);
    copy.details.componentSuccesses = wrapInArray(copy.details.componentSuccesses);
    copy.details.runTestResult.failures = wrapInArray(copy.details.runTestResult.failures);
    copy.details.runTestResult.codeCoverage = wrapInArray(copy.details.runTestResult.codeCoverage);
    if (deleteDependentClassNeedsRecompilationErrors) {
        deleteDeploymentFailuresDueToDependentClasses(copy);
        deleteTestFailuresDueToDependentClasses(copy);
    }
    return copy;
}

const MESSAGE_PREFIXES = {
    TEST_DEPENDENT_CLASS_NEEDS_RECOMPILATION: "line -1, column -1: Dependent class is invalid and needs recompilation",
    DEPLOYMENT_DEPENDENT_CLASS_NEEDS_RECOMPILATION: "Dependent class is invalid and needs recompilation:\n Class ",
} as const;

function deleteTestFailuresDueToDependentClasses(deploymentResult: DeploymentResult) {
    deploymentResult.details.runTestResult.failures = deploymentResult.details.runTestResult.failures.filter(
        (failure) => {
            const isDueToDependentClass = failure.message.startsWith(
                MESSAGE_PREFIXES.TEST_DEPENDENT_CLASS_NEEDS_RECOMPILATION
            );
            return !isDueToDependentClass;
        }
    );
}

function deleteDeploymentFailuresDueToDependentClasses(deploymentResult: DeploymentResult) {
    const classNameToDeploymentError = new Map<string, DeployMessage>();
    const componentFailures = deploymentResult.details.componentFailures;
    for (const failure of componentFailures) {
        if (failure.componentType == "ApexClass") {
            classNameToDeploymentError.set(failure.fullName, failure);
        }
    }
    const newComponentFailures: DeployMessage[] = [];
    for (const failure of componentFailures) {
        const isCausedByDependentClass = failure.problem.startsWith(
            MESSAGE_PREFIXES.DEPLOYMENT_DEPENDENT_CLASS_NEEDS_RECOMPILATION
        );
        if (!isCausedByDependentClass) {
            newComponentFailures.push(failure);
            continue;
        }
        const splitProblem = failure.problem
            .substring(MESSAGE_PREFIXES.DEPLOYMENT_DEPENDENT_CLASS_NEEDS_RECOMPILATION.length)
            .split(" ");
        const classWithError = splitProblem[0] ?? "";
        if (classWithError != "" && !classNameToDeploymentError.has(classWithError)) {
            /**
             * Class was not included in deployment, we should add custom failure
             * to report to make it more clear
             */
            const message = splitProblem.filter((_, index) => index > 1).join(" ");
            newComponentFailures.push({
                ...failure,
                fileName: `classes/${classWithError}.cls`,
                fullName: classWithError,
                problem: message,
            });
        }
    }

    deploymentResult.details.componentFailures = newComponentFailures;
}
