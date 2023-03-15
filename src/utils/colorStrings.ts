const RED =
    {OPEN: '\x1B[31m', CLOSE: '\x1B[39m'} as const

export function red(content) {
    return `${RED.OPEN}${content}${RED.CLOSE}`;
}

const BOLD =
    {OPEN: '\x1B[1m', CLOSE: '\x1B[22m'}

export function bold(content: string) {
    return `${BOLD.OPEN}${content}${BOLD.CLOSE}`
}

const YELLOW = {OPEN: "\x1B[33m", CLOSE: "\x1B[39m"} as const;

export function yellow(content: string) {
    return `${YELLOW.OPEN}${content}${YELLOW.CLOSE}`;
}

const GREEN_OPEN = "\x1B[32m";
const GREEN_CLOSE = "\x1B[39m";

export function green(content: string) {
    return `${GREEN_OPEN}${content}${GREEN_CLOSE}`;
}
