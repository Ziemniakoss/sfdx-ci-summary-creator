import Environment from "../../src/utils/Environment";
import * as assert from "assert";


function get_exists() {
	context("variable exists", () => {
		it("should return string", () => {
			const variableName = "myVarName"
			const value = "varValue"
			process.env[variableName] = value
			const result = new Environment().getVar(variableName)
			assert.equal(result, value)
		})
	})
}

function get_doesntExist() {
	context("variable doesn't exist", () => {
		it("should return null", () => {
			const result = new Environment().getVar("dasdasdhdHHHDHAsdaLLLfafa___aaa__---=")
			assert.equal(result, null)
		})
	})
}

function testGet() {
	get_doesntExist()
	get_exists()
}

export function testEnvironment() {
	describe("Environment", () => {
		describe("# get", testGet)
	})
}



