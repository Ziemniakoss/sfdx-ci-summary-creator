import { DeploymentResult } from "../dataTypes/deployment";

export abstract class ReportGenerator {
    /**
     * Create report and write it to default location.
     * Location for report should be overridable by environmental variables
     *
     * @param deployment deployment result for which report should be generated
     * @param writeToDisc write report to file, specified by generator implementation
     * @return report content, mainly for testing purposes
     */
    abstract createReport(deployment: DeploymentResult, writeToDisc): Promise<string>;

    abstract shouldBeDisabled(): boolean;

    async createReportIfNotDisabled(deployment: DeploymentResult, writeToDisc) {
        if (this.shouldBeDisabled()) {
            return this.createReport(deployment, writeToDisc);
        }
        return null;
    }
}
