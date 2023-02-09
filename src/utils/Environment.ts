/**
 *
 */
export default class Environment {
    /**
     *  Get environmental variable
     * @param key environmental variable name
     */
    public getVar(key: string): string | null {
        return process.env[key];
    }
}
