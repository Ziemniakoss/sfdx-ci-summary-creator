export const ENV_VARS_NAMES = {
    JUNIT_REPORT: {
        LOCATION: "CI_SUMMARY_JUNIT_SUMMARY_OUTPUT_PATH",
    } as const,
    COMMON: {
        SHOW_FAILED_DUE_TO_DEPENDENT: "CI_SUMMARY_SHOW_DEPENDENT_ERRORS",
    } as const,
} as const;
