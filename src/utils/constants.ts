export const PREFIX = "CI_SUMMARY_";
export const ENV_VARS_NAMES = {
    JUNIT_REPORT: {
        LOCATION: `${PREFIX}JUNIT_LOCATION`,
        DISABLED: `${PREFIX}JUNIT_DISABLED`,
    } as const,
    COVERALLS: {
        LOCATION: `${PREFIX}COVERALLS_LOCATION`,
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
        DISABLED: `${PREFIX}MARKDOWN_DISABLED`,
    } as const,
    /**
     * Controls pretty console report
     */
    CONSOLE: {
        DISABLED: `${PREFIX}CONSOLE_DISABLED`,
        UNIT_TEST_TIME_WARNING_LEVEL: `${PREFIX}CONSOLE_TIME_WARNING`,
        /**
         * Time in milliseconds form which time of unit test is marked as red
         */
        UNIT_TEST_TIME_ERROR_LEVEL: `${PREFIX}CONSOLE_TIME_ERROR`,
    } as const,
    COMMON: {
        /**
         * Link to org that code is deployed to.
         * Used for example to generate link to deployment page
         */
        ORG_LINK: `${PREFIX}ORG_LINK`,
        SHOW_FAILED_DUE_TO_DEPENDENT: "CI_SUMMARY_SHOW_DEPENDENT_ERRORS",
        /**
         * Location which is checked by GitHub for markdown files
         * that will be displayed as summary of step
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
