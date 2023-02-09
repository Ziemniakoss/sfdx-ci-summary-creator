import { join } from "path";
import { promises } from "fs";
import { preprocess } from "../../src/utils/preprocessing";
import * as assert from "assert";
describe("preprocessing", () => {
    describe("# preprocess", () => {
        context("with deployment errors caused by dependent classes included in deployment", () => {
            const processingPromise = promises
                .readFile(
                    join(
                        "test_resources",
                        "example_deployment_reports",
                        "deployment_dependentClassNeedsRecompilation.json"
                    ),
                    "utf-8"
                )
                .then((fileConsent) => preprocess(JSON.parse(fileConsent), true));
            it("should filter out  errors based on dependent classes", async () => {
                const preporcessed = await processingPromise;
                assert.equal(preporcessed.details.componentFailures.length, 1);
            });
        });
        context(
            "with deployment errors caused by dependent classes not included in deployment",
            () => {
                const processingPromise = promises
                    .readFile(
                        join(
                            "test_resources",
                            "example_deployment_reports",
                            "deployment_dependentClassNeedsRecompilation_withoutClass.json"
                        ),
                        "utf-8"
                    )
                    .then((fileConsent) => preprocess(JSON.parse(fileConsent), true));
                it("should filter out  errors based on dependent classes", async () => {
                    const preprocessed = await processingPromise;
                    assert.equal(preprocessed.details.componentFailures.length, 1);
                });
                it("should have error linked to dependent class", async () => {
                    const preprocessed = await processingPromise;
                    assert.equal(preprocessed.details.componentFailures[0].fullName, "Class2");
                });
            }
        );
    });
});
