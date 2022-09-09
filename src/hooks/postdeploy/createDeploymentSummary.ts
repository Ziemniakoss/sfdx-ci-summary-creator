import { DeploymentResult } from "../../dataTypes/deployment";
import JUnitDeploymentSummaryCreator from "../../JUnitDeploymentSummaryCreator";
import MarkdownDeploymentSummaryCreator from "../../MarkdownDeploymentSummaryCreator";
import CoverallsCoverageReportCreator from "../../CoverallsCoverageReportCreator";
import * as fs from "fs";

interface PostDeploymentEvent {
  result: {
    response: DeploymentResult;
  };
}

const hook = async function (event: PostDeploymentEvent) {
  await fs.promises.writeFile("test.json", JSON.stringify(event));
  const deploymentResult = event.result.response;
  const promises = [
    new MarkdownDeploymentSummaryCreator().createSummary(deploymentResult),
    new JUnitDeploymentSummaryCreator().createSummary(deploymentResult),
    new CoverallsCoverageReportCreator().createSummary(deploymentResult),
  ];
  return Promise.all(promises);
};
export default hook;
