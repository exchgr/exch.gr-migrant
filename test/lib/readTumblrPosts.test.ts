import {createStubInstance, restore, stub} from "sinon"
import {_onlyFiles, readTumblrPosts} from "../../src/lib/readTumblrPosts"
import {expect} from "chai"
import fs, {Dirent} from "fs"

describe("readTumblrPosts", () => {
	afterEach(restore)

	it("should read a file and return a TumblrPost", () => {
		const tumblrFilename = "1.html"
		const tumblrDirectory = "here"

		const dirent = createStubInstance(Dirent, {
			isFile: true
		})
		dirent.name = tumblrFilename
		dirent.path = tumblrDirectory

		const domTextContent = "hi"

		stub(fs, "readFileSync")
			.withArgs(`${tumblrDirectory}/${tumblrFilename}`).returns(Buffer.from(`<body>${domTextContent}</body>`))

		stub(fs, "readdirSync")
			.withArgs(tumblrDirectory, { withFileTypes: true }).returns([dirent])

		const tumblrPosts = readTumblrPosts(tumblrDirectory)

		expect(tumblrPosts[0].id).to.eq("1")
		expect(tumblrPosts[0].dom.querySelector("body")!.textContent!).to.eq(domTextContent)
	})

	describe("_onlyFiles", () => {
		it("should return true for files", () => {
			const dirent = createStubInstance(Dirent, {
				isFile: true
			})

			expect(_onlyFiles(dirent)).to.be.true
		})

		it("should return false for non-files", () => {
			const dirent = createStubInstance(Dirent, {
				isFile: false
			})

			expect(_onlyFiles(dirent)).to.be.false
		})
	})
})
