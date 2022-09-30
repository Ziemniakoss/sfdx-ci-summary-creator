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
  const deploymentResult = event?.result?.response;
  if (deploymentResult == null) {
    return;
  }
  const promises: Promise<any>[] = [
    new MarkdownDeploymentSummaryCreator()
      .createSummary(deploymentResult)
      .catch(printError),
    new JUnitDeploymentSummaryCreator()
      .createSummary(deploymentResult)
      .catch(printError),
    new CoverallsCoverageReportCreator()
      .createSummary(deploymentResult)
      .catch(printError),
  ];
  return Promise.all(promises).catch(printError);
};

function printError(error) {
  console.log("AAAAAAAAAA");
  console.error(
    "============================Error in hook======================================="
  );
  console.error(error);
  console.error(
    "====================================For========================================="
  );
}
export default hook;
