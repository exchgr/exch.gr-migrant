import {expect} from "chai"
import {partition, promiseSequence, titleize} from "../../src/lib/util"

describe("util", () => {
	describe("partition", () => {
		it("should split an array in two based on a predicate", () => {
			expect(partition([true, false], (element) => element)).to.deep.eq([[true], [false]])
		})
	})

	describe("promiseSequence", () => {
		it("should return an array of promises in the order they were received", async () => {
			const promises = [
				new Promise<number>(resolve => resolve(0)),
				new Promise<number>(resolve => resolve(1)),
				new Promise<number>(resolve => resolve(2)),
				new Promise<number>(resolve => resolve(3)),
			]

			expect(await promiseSequence(promises)).to.deep.eq([0, 1, 2, 3])
		})
	})

	describe("titleize", () => {
		it("should titleize a string", () => {
			expect(titleize("hi-there, bob")).to.eq("Hi-There, Bob")
		})
	})
})
