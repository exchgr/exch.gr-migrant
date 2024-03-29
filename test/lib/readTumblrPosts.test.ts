import {createStubInstance, stub} from "sinon"
import FsProxy from "../../src/fsProxy"
import {_onlyFiles, readTumblrPosts} from "../../src/lib/readTumblrPosts"
import {expect} from "chai"
import { Dirent } from "fs"

describe("readTumblrPosts", () => {
	it("should read a file and return a TumblrPost", () => {
		const tumblrFilename = "1.html"
		const tumblrDirectory = "here"

		const dirent = createStubInstance(Dirent, {
			isFile: true
		})
		dirent.name = tumblrFilename
		dirent.path = tumblrDirectory

		const fsProxy = new FsProxy()

		const domTextContent = "hi"

		stub(fsProxy, "readFileSync")
			.withArgs(`${tumblrDirectory}/${tumblrFilename}`).returns(Buffer.from(`<body>${domTextContent}</body>`))

		stub(fsProxy, "readdirSyncWithFileTypes")
			.withArgs(tumblrDirectory).returns([dirent])

		const tumblrPosts = readTumblrPosts(fsProxy, tumblrDirectory)

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
