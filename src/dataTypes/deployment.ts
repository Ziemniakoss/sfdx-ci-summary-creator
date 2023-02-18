export type ComponentType = "ApexClass" | string;
export interface DeploymentResult {
    checkOnly: boolean;
    createdDate: string;
    completedDate: string;
    details: DeploymentDetails;
    numberComponentErrors;
    numberComponentsDeployed;
    numberComponentsTotal;
    numberTestErrors;
    numberTestsCompleted;
    numberTestsTotal;
}

interface DeploymentDetails {
    componentFailures: DeployMessage[];
    componentSuccesses: DeployMessage[];
    runTestResult: RunTestsResult;
}

interface CodeLocation {
    column: number | string;
    line: number | string;
    numExecutions: number | string;
    time: number | string;
}

export interface CodeCoverageResult {
    numLocationsNotCovered: number;
    numLocations: number;
    dmlInfo?: CodeLocation[];
    id: string;
    locationsNotCovered: CodeLocation[];
    methodInfo: CodeLocation[];
    name: string;
    namespace: string;
    type: string;
}

interface CodeCoverageWarning {
    message: string;
    name: string;
    namespace: string;
}

export interface RunTestFailure {
    message: string;
    methodName: string;
    name: string;
    namespace: string;
    stackTrace: string;
    time: number;
    type: string;
}

interface FlowCoverageResult {
    elementsNotCovered: string;
    flowId: string;
    flowName: string;
    flowNamespace: string;
    numElements: string | number;
    numElementsNotCovered: string | number;
    processType: string;
}

interface FlowCoverageWarning {
    flowId: string;
    flowName: string;
    flowNamespace: string;
    message: string;
}

export interface RunTestSuccess {
    methodName: string;
    name: string;
    namespace: string;
    time: number | string;
}

export interface RunTestsResult {
    apexLogId: string;
    codeCoverage: CodeCoverageResult[];
    codeCoverageWarnings: CodeCoverageWarning[];
    failures: RunTestFailure[];
    flowCoverage: FlowCoverageResult[];
    flowCoverageWarnings: FlowCoverageWarning[];
    numFailures: number | string;
    numTestsRun: string | number;
    successes: RunTestSuccess[];
}

type DeployProblemType = "Error" | "Warning";
export interface DeployMessage {
    changed: string;
    columnNumber: number;
    componentType: ComponentType;
    deleted: string;
    fileName: string;
    fullName: string;
    lineNumber: string;
    problem: string;
    problemType: DeployProblemType;
    success: string;
}
