const PREFIX = "CI_SUMMARY_";
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
    } as const,
    COMMON: {
        SHOW_FAILED_DUE_TO_DEPENDENT: "CI_SUMMARY_SHOW_DEPENDENT_ERRORS",
        /**
         * Location which is checked by GitHub for markdown files
         * that will be displayed as summary of step
         */
        GITHUB_STEP_SUMMARY: "GITHUB_STEP_SUMMARY",
    } as const,
} as const;
