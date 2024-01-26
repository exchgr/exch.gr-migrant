import {stub} from "sinon"
import FsProxy from "../../src/fsProxy"
import {readTumblrPosts} from "../../src/lib/readTumblrPosts"
import {expect} from "chai"

describe("readTumblrPosts", () => {
	// TODO: only read files, not directories
	it("should read a file and return a TumblrPost", () => {
		const tumblrFilenames = ["1.html"]
		const tumblrDirectory = "here"

		const fsProxy = new FsProxy()

		const domTextContent = "hi"

		stub(fsProxy, "readFileSync")
			.withArgs(tumblrFilenames[0]).returns(Buffer.from(`<body>${domTextContent}</body>`))

		stub(fsProxy, "readdirSync")
			.withArgs(tumblrDirectory).returns(tumblrFilenames)

		const tumblrPosts = readTumblrPosts(fsProxy, tumblrDirectory)

		expect(tumblrPosts[0].id).to.eq("1")
		expect(tumblrPosts[0].dom.querySelector("body")!.textContent!).to.eq(domTextContent)
	})
})
