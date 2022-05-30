import {DeploymentResult} from "../../dataTypes/deployment";
import JUnitDeploymentSummaryCreator from "../../JUnitDeploymentSummaryCreator";
import MarkdownDeploymentSummaryCreator from "../../MarkdownDeploymentSummaryCreator";

interface PostDeploymentEvent {
	result: {
		response: DeploymentResult;
	};
}

const hook = async function (event: PostDeploymentEvent) {
	const deploymentResult = event.result.response;
	const promises = [
		new MarkdownDeploymentSummaryCreator().createSummary(deploymentResult),
		new JUnitDeploymentSummaryCreator().createSummary(deploymentResult)
	];
	return Promise.all(promises);
};
export default hook;
