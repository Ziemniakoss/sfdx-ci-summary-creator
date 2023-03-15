import { DeploymentResult } from "../../dataTypes/deployment";
import JUnitDeploymentSummaryCreator from "../../reportGenerators/JUnitDeploymentSummaryCreator";
import Environment from "../../utils/Environment";
import { preprocess } from "../../utils/preprocessing";
import CoverallsCoverageReportCreator from "../../reportGenerators/CoverallsCoverageReportCreator";
import MarkdownDeploymentSummaryCreator from "../../reportGenerators/MarkdownDeploymentSummaryCreator";
import { ENV_VARS_NAMES } from "../../utils/constants";
import ReadableConsoleReport from "../../reportGenerators/ReadableConsoleReport";

interface PostDeploymentEvent {
    result: {
        response: DeploymentResult;
    };
}

const hook = async function (event: PostDeploymentEvent) {
    const env = new Environment();
    const showDependentErrors = Boolean(env.getVar(ENV_VARS_NAMES.COMMON.SHOW_FAILED_DUE_TO_DEPENDENT));
    const deploymentResult = preprocess(event?.result?.response, !showDependentErrors);
    if (deploymentResult == null) {
        return;
    }
    const promises: Promise<any>[] = [
        new MarkdownDeploymentSummaryCreator(env),
        new JUnitDeploymentSummaryCreator(env),
        new CoverallsCoverageReportCreator(env),
        new ReadableConsoleReport(env),
    ]
        .filter((generator) => !generator.shouldBeDisabled())
        .map((generator) => generator.createReport(deploymentResult).catch((error) => printError(error)));

    return (
        Promise.all(promises)
            .catch(printError)
            // Just in case
            .catch(() => {})
    );
};

function printError(error) {
    console.error("============================Error in hook=======================================");
    console.error(error);
    console.error("====================================For=========================================");
}

export default hook;
