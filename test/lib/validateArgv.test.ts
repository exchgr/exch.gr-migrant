import {expect} from "chai"
import {createStubInstance, restore, stub} from "sinon"
import {validateArgv} from "../../src/lib/validateArgv"
import fs, {Dirent} from "fs"

const strapiUrl = "http://localhost:1337"

describe("validateArgv", () => {
	afterEach(restore)

	it("should fail if strapi server is unspecified", () => {
		const argv: string[] = []

		expect(() => validateArgv(argv)).to.throw('Strapi server unspecified.')
	})

	it("should fail with a nonexistent squarespace file", async () => {
		const squarespaceFilename = "hahaha nope.txt"

		const argv = [
			'-s', squarespaceFilename,
			'-r', strapiUrl
		]

		stub(fs, "existsSync").withArgs(squarespaceFilename).returns(false)

		expect(() => validateArgv(argv)).to.throw(`Squarespace archive ${squarespaceFilename} doesn't exist.`)
	})

	it("should fail with a nonexistent tumblr directory", () => {
		const squarespaceFilename = 'resources/Squarespace-Wordpress-Export-10-12-2023.xml'
		const tumblrDirectory = "nowhere"

		const argv = [
			'-s', squarespaceFilename,
			'-t', tumblrDirectory,
			'-r', strapiUrl
		]

		stub(fs, "existsSync")
			.withArgs(squarespaceFilename).returns(true)
			.withArgs(tumblrDirectory).returns(false)

		expect(() => validateArgv(argv)).to.throw(`Tumblr archive ${tumblrDirectory} doesn't exist.`)
	})

	it("should fail with an occupied cache directory", () => {
		const squarespaceFilename = 'resources/Squarespace-Wordpress-Export-10-12-2023.xml'
		const tumblrDirectory = "nowhere"
		const cacheDir = "/Users/test/cacheDir/"

		const argv = [
			'-s', squarespaceFilename,
			'-t', tumblrDirectory,
			'-r', strapiUrl,
			'-c', cacheDir
		]

		stub(fs, "existsSync")
			.withArgs(squarespaceFilename).returns(true)
			.withArgs(tumblrDirectory).returns(true)

		stub(fs, "readdirSync")
			.withArgs(cacheDir).returns([createStubInstance(Dirent)])

		expect(() => validateArgv(argv)).to.throw(`Cache directory ${cacheDir} isn't empty.`)
	})

	it("should return valid options", () => {
		const squarespaceFilename = 'resources/Squarespace-Wordpress-Export-10-12-2023.xml'
		const tumblrDirectory = "where"
		const cacheDir = "/Users/test/cacheDir/"

		const argv = [
			'-s', squarespaceFilename,
			'-t', tumblrDirectory,
			'-r', strapiUrl,
			'-c', cacheDir
		]

		const options = {
			"_": [],
			"s": squarespaceFilename,
			"squarespace": squarespaceFilename,
			"t": tumblrDirectory,
			"tumblr": tumblrDirectory,
			"r": strapiUrl,
			"strapi": strapiUrl,
			"c": cacheDir,
			"cacheDirectory": cacheDir
		}

		stub(fs, "existsSync")
			.withArgs(squarespaceFilename).returns(true)
			.withArgs(tumblrDirectory).returns(true)

		stub(fs, "readdirSync")
			.withArgs(cacheDir).returns([])

		expect(validateArgv(argv)).to.deep.eq(options)
	})

	it("should not require all importers at once", () => {
		const squarespaceFilename = 'resources/Squarespace-Wordpress-Export-10-12-2023.xml'
		const cacheDir = "/Users/test/cacheDir/"

		const argv = [
			'-s', squarespaceFilename,
			'-r', strapiUrl,
			'-c', cacheDir
		]

		const options = {
			"_": [],
			"s": squarespaceFilename,
			"squarespace": squarespaceFilename,
			"r": strapiUrl,
			"strapi": strapiUrl,
			"c": cacheDir,
			"cacheDirectory": cacheDir
		}

		stub(fs, "existsSync")
			.withArgs(squarespaceFilename).returns(true)

		stub(fs, "readdirSync")
			.withArgs(cacheDir).returns([])

		expect(validateArgv(argv)).to.deep.eq(options)
	})

	it("should require at least one importer", () => {
		const cacheDir = "/Users/test/cacheDir/"

		const argv = [
			'-r', strapiUrl,
			'-c', cacheDir
		]

		const options = {
			"_": [],
			"r": strapiUrl,
			"strapi": strapiUrl,
			"c": cacheDir,
			"cacheDirectory": cacheDir
		}

		expect(() => validateArgv(argv)).to.throw(
`No importers specified. Please check your command line arguments.
For more information, see the README or run this command with -h.`
		)
	})
})
