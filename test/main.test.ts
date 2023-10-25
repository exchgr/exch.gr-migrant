import {expect} from 'chai'
import {main} from "../src/main";

describe("main", () => {
	it("should run", () => {
		expect(main()).to.eq(undefined)
	})
})
