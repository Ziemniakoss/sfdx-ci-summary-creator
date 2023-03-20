import { startIndexing } from "../../utils/metadataIndex";
import Environment from "../../utils/Environment";
import { ENV_VARS_NAMES } from "../../utils/constants";

const TIMER_NAME = "CIRC: metadata indexing time";

const hook = async function () {
    const env = new Environment();
    const areTimersEnabled = env.getBooleanVar(ENV_VARS_NAMES.COMMON.ENABLE_TIMERS);
    if (areTimersEnabled) {
        console.time(TIMER_NAME);
    }
    const indexingPromise = startIndexing();
    if (areTimersEnabled) {
        indexingPromise.then(() => console.timeEnd(TIMER_NAME));
    }
};

export default hook;
