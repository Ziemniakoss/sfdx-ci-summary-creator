import { wrapInArray } from "../../src/utils/utils";

const assert = require("assert");

function wrapInArray_null() {
    context("for null", () => {
        it("should return empty array", () => {
            const result = wrapInArray(null);
            assert.deepEqual(result, [], "Should return empty array");
        });
    });
}

function wrapInArray_array() {
    context("for array", () => {
        it("should return same array", () => {
            const input = [1, 2, 3];
            assert.equal(wrapInArray(input), input, "Should return same array instance");
        });
    });
}

function wrapInArray_object() {
    context("for object", () => {
        it("should return object wrapped in array", () => {
            const objectToWrap = { fieldOne: "value", fieldTwo: [1, 2, 3] };
            const result = wrapInArray(objectToWrap);
            assert.deepEqual(result, [objectToWrap]);
        });
    });
}

function testWrapInArray() {
    describe("# wrapInArray", () => {
        wrapInArray_null();
        wrapInArray_array();
        wrapInArray_object();
    });
}

export function testUtils() {
    describe("utils", () => {
        testWrapInArray();
    });
}
//TODO tests for mkdirs
//TODO tests for getProjectRoot
//TODO tests for findFile
//TODO tests for findFile
