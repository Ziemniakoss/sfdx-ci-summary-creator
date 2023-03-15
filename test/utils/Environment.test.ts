import Environment from "../../src/utils/Environment";
import * as assert from "assert";

function get_exists() {
    context("variable exists", () => {
        it("should return string", () => {
            const variableName = "myVarName";
            const value = "varValue";
            process.env[variableName] = value;
            const result = new Environment().getVar(variableName);
            assert.equal(result, value);
        });
    });
}

function get_doesntExist() {
    context("variable doesn't exist", () => {
        it("should return null", () => {
            const result = new Environment().getVar("dasdasdhdHHHDHAsdaLLLfafa___aaa__---=");
            assert.equal(result, null);
        });
    });
}

function testGet() {
    get_doesntExist();
    get_exists();
}

export function testEnvironment() {
    describe("Environment", () => {
        describe("# get", testGet);
    });
}

describe("Environment # getBooleanVar", () => {
    context("variable is 'true'", () => {
        const key = "SomeKey2";
        process.env[key] = "true";
        const result = new Environment().getBooleanVar(key);
        it("should return true", () => {
            assert.equal(result, true);
        });
    });
    context("variable is 'false'", () => {
        const key = "SomeKey1";
        process.env[key] = "false";
        const result = new Environment().getBooleanVar(key);
        it("should return false", () => {
            assert.equal(result, false);
        });
    });
    context("variable has no value", () => {
        const env = new Environment();
        const result = env.getBooleanVar("AaAaBbBbCcCc");
        it("should be false", () => {
            assert.equal(result, false, "Non existing-variables should be false");
        });
    });
});
