/**
 * Wrapper for process.env that allows us to mock it
 * in tests
 */
export default class Environment {
    /**
     *  Get environmental variable
     * @param key environmental variable name
     */
    public getVar(key: string): string | null {
        return process.env[key];
    }

    public getBooleanVar(key: string) {
        const value = this.getVar(key)?.toLowerCase();
        switch (value) {
            case "true":
                return true;
            case "false":
                return false;
            default:
                return false;
        }
    }

    public isSet(key: string) {
        const value = this.getVar(key);
        return value != null && value != "";
    }
}
