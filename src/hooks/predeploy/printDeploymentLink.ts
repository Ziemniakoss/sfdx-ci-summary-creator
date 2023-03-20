import {ENV_VARS_NAMES} from "../../utils/constants";
import Environment from "../../utils/Environment";

const hook = async function () {
    const env = new Environment();
    if(env.isSet(ENV_VARS_NAMES.COMMON.ORG_LINK)) {
        const linkToDeploymentPage =`${env.getVar(ENV_VARS_NAMES.COMMON.ORG_LINK)}/lightning/setup/DeployStatus/home`
        console.log(`\n\nLink to deployment page: ${linkToDeploymentPage}\n\n`)
    }
}
export default hook
