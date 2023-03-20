export const PREFIX = "CI_SUMMARY_";
export const ENV_VARS_NAMES = {
    /**
     * Variables controlling JUnit report generation
     */
    JUNIT_REPORT: {
        /**
         * Where should report be generated.
         * Default: `test-results/sfdx-deployment.xml`
         */
        LOCATION: `${PREFIX}JUNIT_LOCATION`,
        /**
         * Disable JUnit report generation
         * Default: `false`
         */
        DISABLED: `${PREFIX}JUNIT_DISABLED`,
    } as const,
    /**
     * Controls Coveralls report generation
     */
    COVERALLS: {
        /**
         * Where should report be generated.
         * Default: `deployment_reports/coveralls.json`
         */
        LOCATION: `${PREFIX}COVERALLS_LOCATION`,
        /**
         * Disable Coveralls report generation
         * Default: `false`
         */
        DISABLED: `${PREFIX}COVERALLS_DISABLED`,
    } as const,
    /**
     * Controls markdown report generator
     */
    MARKDOWN: {
        /**
         * Where should markdown report be generated.
         * If not provided, report will be outputted to
         * file marked by as GitHub as step summary file
         * or to `deployment_report.md` file
         */
        LOCATION: `${PREFIX}MARKDOWN_LOCATION`,
        /**
         * Disable markdown report generation
         * Default: `false`
         */
        DISABLED: `${PREFIX}MARKDOWN_DISABLED`,
    } as const,
    /**
     * Controls pretty console report
     */
    CONSOLE: {
        DISABLED: `${PREFIX}CONSOLE_DISABLED`,
    } as const,
    /**
     * Variables not tied to one report type
     */
    COMMON: {
        /**
         * Link to org that code is deployed to.
         * Used for example to generate link to deployment page.
         *
         * __WARNING__
         *
         * Link should be provided without last '/' character, for example:
         * `https://some-sandbox-or-org-name.lightning.force.com`
         *
         */
        ORG_LINK: `${PREFIX}ORG_LINK`,
        /**
         * Show failed test cases and deployment errors that were caused
         * by dependent classes
         */
        SHOW_FAILED_DUE_TO_DEPENDENT: "CI_SUMMARY_SHOW_DEPENDENT_ERRORS",
        /**
         * Location which is checked by GitHub for markdown files
         * that will be displayed as summary of step.
         */
        GITHUB_STEP_SUMMARY: "GITHUB_STEP_SUMMARY",
        /**
         * Enable timers measuring time of:
         * - indexing
         * - report generation
         */
        ENABLE_TIMERS: `${PREFIX}ENABLE_TIMERS`,
    } as const,
} as const;

export const METADATA_TYPES = {
    APEX_CLASS: "Class",
    APEX_TRIGGER: "Trigger",
} as const;

export const FILE_EXTENSIONS = {
    APEX_CLASS: "cls",
    APEX_TRIGGER: "trigger",
} as const;
