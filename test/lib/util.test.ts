import {expect} from "chai"
import {
	syncMap,
	objectToFormData,
	partition,
	titleize
} from "../../src/lib/util"

describe("util", () => {
	describe("partition", () => {
		it("should split an array in two based on a predicate", () => {
			expect(partition([true, false], (element) => element)).to.deep.eq([[true], [false]])
		})
	})

	describe("syncMap", () => {
		it("should return an array of promises in the order they were received", async () => {
			const double = async (number: number) => number * 2

			expect(await syncMap([0, 1, 2, 3], double)).to.deep.eq([0, 2, 4, 6])
		})
	})

	describe("titleize", () => {
		it("should titleize a string", () => {
			expect(titleize("hi-there, bob")).to.eq("Hi-There, Bob")
		})
	})

	describe("objectToFormData", () => {
		it("should convert an object to FormData", () => {
			const filename =
				"file:///Users/test/tumblr-export/media/673954189579288576_0.png"
			const file = new Blob(["hi"])
			const object = {files: {file, filename}}

			const formData = objectToFormData(object)

			expect((formData.get("files")! as File).name).to.eq(filename)
		})
	})
})
