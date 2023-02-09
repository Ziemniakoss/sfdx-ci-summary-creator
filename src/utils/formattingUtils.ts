import { DeploymentResult } from "../dataTypes/deployment";

const MESSAGE_PREFIXES = {
    TEST_DEPENDENT_CLASS_NEEDS_RECOMPILATION:
        "line -1, column -1: Dependent class is invalid and needs recompilation",

    DEPLOYMENT_DEPENDENT_CLASS_NEEDS_RECOMPILATION:
        "Dependent class is invalid and needs recompilation",
} as const;

/**
 * Checks if messages signifies that one of classes needs recompilation.
 * This usually means that error can be skipped
 *
 * @param failureMessage message in test failure
 *
 */
export function isTestDependentClassNeedsRecompilationError(failureMessage: string): boolean {
    return failureMessage.startsWith(MESSAGE_PREFIXES.TEST_DEPENDENT_CLASS_NEEDS_RECOMPILATION);
}
export function isDeploymentDependentClassNeedsRecompilationError(failureMessage: string): boolean {
    return failureMessage.startsWith(
        MESSAGE_PREFIXES.DEPLOYMENT_DEPENDENT_CLASS_NEEDS_RECOMPILATION
    );
}

export function prepareRunTestFailureMessage(
    failureMessage: string,
    deploymentResult: DeploymentResult
): string {
    if (isTestDependentClassNeedsRecompilationError(failureMessage)) {
        return "One or more of classes needs recompilation";
    }
    return failureMessage;
}
