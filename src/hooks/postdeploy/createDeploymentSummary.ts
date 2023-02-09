import { DeploymentResult } from "../../dataTypes/deployment";
import MarkdownDeploymentSummaryCreator from "../../MarkdownDeploymentSummaryCreator";
import CoverallsCoverageReportCreator from "../../CoverallsCoverageReportCreator";
import JUnitDeploymentSummaryCreator from "../../reportGenerators/JUnitDeploymentSummaryCreator";
import Environment from "../../utils/Environment";
import { preprocess } from "../../utils/preprocessing";

interface PostDeploymentEvent {
    result: {
        response: DeploymentResult;
    };
}

const hook = async function (event: PostDeploymentEvent) {
    const deploymentResult = preprocess(event?.result?.response, true);
    const env = new Environment();
    if (deploymentResult == null) {
        return;
    }
    const promises: Promise<any>[] = [
        new MarkdownDeploymentSummaryCreator().createSummary(deploymentResult).catch(printError),
        new JUnitDeploymentSummaryCreator(env).createReport(deploymentResult).catch(printError),
        new CoverallsCoverageReportCreator().createSummary(deploymentResult).catch(printError),
    ];
    return (
        Promise.all(promises)
            .catch(printError)
            // Just in case
            .catch(() => {})
    );
};

function printError(error) {
    console.error(
        "============================Error in hook======================================="
    );
    console.error(error);
    console.error(
        "====================================For========================================="
    );
}
export default hook;
