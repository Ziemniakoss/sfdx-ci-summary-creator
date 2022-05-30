import { DeploymentResult } from "../../dataTypes/deployment";
import JUnitDeploymentSummaryCreator from "../../JUnitDeploymentSummaryCreator";
import MarkdownDeploymentSummaryCreator from "../../MarkdownDeploymentSummaryCreator";

interface PostDeploymentEvent {
  result: {
    response: DeploymentResult;
  };
}

const hook = async function (event: PostDeploymentEvent) {
  const deploymentResult = event.result.response;
  const promises = [];
  if (process.env["CI_SUMMARY_JUNIT_SUMMARY_GENERATE"]) {
    promises.push(
      new JUnitDeploymentSummaryCreator().createSummary(deploymentResult)
    );
  }
  if (process.env["CI_SUMMARY_MD_DEPLOYMENT_REPORT_GENERATE"] || process.env["GITHUB_ACTION"]) {
    promises.push(
      new MarkdownDeploymentSummaryCreator().createSummary(deploymentResult)
    );
  }
  return Promise.allSettled(promises);
};
export default hook;
