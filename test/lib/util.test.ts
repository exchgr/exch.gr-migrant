import {expect} from "chai"
import {partition} from "../../src/lib/util"

describe("util", () => {
	describe("partition", () => {
		it("should spit an array in two based on a predicate", () => {
			expect(partition([true, false], (element) => element)).to.deep.eq([[true], [false]])
		})
	})
})
