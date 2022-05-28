# Deployment summary creator

Generate deployment summaries

## Summaries types

### JUnit deployement report

Creates xml file in JUnit format summarizing deployment of compoennts and apex unit tests results. Useful in bitbucket
pipelines for summarizing deployment without need for token generation

![Image showing how bitbucket displays this kind of report](images/junitsummary.png)

| Variable                             | Default value                    | description                         |
| ------------------------------------ | -------------------------------- | ----------------------------------- |
| CI_SUMMARY_JUNIT_SUMMARY_OUTPUT_PATH | test-results/sfdx-deployment.xml | Where to output result              |
| CI_SUMMARY_JUNIT_SUMMARY_GENERATE    |                                  | Set this to true to generate report |

### Markdown deployemnt report

Creates deployment report in markdown format. Good for automations in GitHub as you can set output file
as [now you can use markdown reports for step summaries](https://github.blog/2022-05-09-supercharging-github-actions-with-job-summaries/)
.

![image showing report for failed deployment ](images/mdreport_deployemntFailed.png)

![image showing report for deployment with failed unit tests](images/mdreport_testsFailed.png)

![image showing report for successful report](images/mdreport_success.png)

| Variable                                     | Default value        | Description                               |
| -------------------------------------------- | -------------------- | ----------------------------------------- |
| CI_SUMMARY_MD_DEPLOYMENT_REPORT_GENERATE     |                      | Set this to any value to generate report  |
| CI_SUMMARY_MD_DEPLOYMENT_REPORT_OUTPUT       | deployment_report.md | File in which report will be created      |
| CI_SUMMARY_MD_DEPLOYMENT_REPORT_MIN_COVERAGE | 75                   | Minimum coverage to mark class as covered |

## How to use?

For basic usage, just install this plugin. It operates on hooks so it should work out of the box.
