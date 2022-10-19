import * as fs from "fs";
import * as path from "path";
import JUnitDeploymentSummaryCreator from "../../src/reportGenerators/JUnitDeploymentSummaryCreator";
import Environment from "../../src/utils/Environment";
import { parseStringPromise } from "xml2js";
import * as assert from "assert";

//TODO more test cases
export function testJUUnitDeploymentSummaryCreator() {
	return describe("JUnitDeploymentSummaryCreator", () => {
		return createReport_dependentClassNeedRecompilation();
	})
}

function createReport_dependentClassNeedRecompilation() {
	return context("one of classes needs recompilation", () => {
		const reportGenerationPromise = fs.promises
			.readFile(path.join("test_resources","example_deployment_reports","/dependentClassNeedsRecompilation.json"), "utf-8")
			.then(JSON.parse)
			.then(deploymentReport => new JUnitDeploymentSummaryCreator(new Environment()).createReport(deploymentReport, false))
		it("should not fail",  async () =>{await reportGenerationPromise})
		const xmlParsingPromise:Promise<any> = reportGenerationPromise.then(parseStringPromise)
		it("should be valid xml", async () => { await  xmlParsingPromise })
		it("should contain 2 failed test cases with description",async  () => {
			const xml = await xmlParsingPromise
			assert.equal(xml.testsuites.testsuite.length, 2)
		})
	})
}
