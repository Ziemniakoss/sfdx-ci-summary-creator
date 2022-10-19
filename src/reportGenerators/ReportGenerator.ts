import { DeploymentResult } from "../dataTypes/deployment";

export interface ReportGenerator {
  /**
   * Create report and write it to default location.
   * Location for report should be overridable by environmental variables
   *
   * @param deployment deployment result for which report should be generated
   * @param writeToDisc write report to file, specified by generator implementation
   * @return report content, mainly for testing purposes
   */
  createReport(deployment: DeploymentResult, writeToDisc): Promise<string>;
}
