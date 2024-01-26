import { expect } from "chai"
import {stub} from "sinon"
import FsProxy from "../../src/fsProxy"
import {validateArgv} from "../../src/lib/validateArgv"
import minimist from "minimist"

const strapiUrl = "http://localhost:1337"

describe("validateArgv", () => {
	it("should fail if strapi server is unspecified", () => {
		const argv: string[] = []

		const fsProxy = new FsProxy()

		expect(() => validateArgv(argv, fsProxy)).to.throw('Strapi server unspecified.')
	})

	it("should fail with a nonexistent squarespace file", async () => {
		const squarespaceFilename = "hahaha nope.txt"

		const argv = [
			'-s', squarespaceFilename,
			'-r', strapiUrl
		]

		const fsProxy = new FsProxy()
		stub(fsProxy, "existsSync").withArgs(squarespaceFilename).returns(false)

		expect(() => validateArgv(argv, fsProxy)).to.throw(`Squarespace archive ${squarespaceFilename} doesn't exist.`)
	})

	it("should fail with a nonexistent tumblr directory", () => {
		const squarespaceFilename = 'resources/Squarespace-Wordpress-Export-10-12-2023.xml'
		const tumblrDirectory = "nowhere"

		const argv = [
			'-s', squarespaceFilename,
			'-t', tumblrDirectory,
			'-r', strapiUrl
		]

		const fsProxy = new FsProxy()

		stub(fsProxy, "existsSync")
			.withArgs(squarespaceFilename).returns(true)
			.withArgs(tumblrDirectory).returns(false)

		expect(() => validateArgv(argv, fsProxy)).to.throw(`Tumblr archive ${tumblrDirectory} doesn't exist.`)
	})

	it("should return valid options", () => {
		const squarespaceFilename = 'resources/Squarespace-Wordpress-Export-10-12-2023.xml'
		const tumblrDirectory = "where"

		const argv = [
			'-s', squarespaceFilename,
			'-t', tumblrDirectory,
			'-r', strapiUrl
		]

		const options = {
			"_": [],
			"s": squarespaceFilename,
			"squarespace": squarespaceFilename,
			"t": tumblrDirectory,
			"tumblr": tumblrDirectory,
			"r": strapiUrl,
			"strapi": strapiUrl
		}

		const fsProxy = new FsProxy()

		stub(fsProxy, "existsSync")
			.withArgs(squarespaceFilename).returns(true)
			.withArgs(tumblrDirectory).returns(true)

		expect(validateArgv(argv, fsProxy)).to.deep.eq(options)
	})
})
