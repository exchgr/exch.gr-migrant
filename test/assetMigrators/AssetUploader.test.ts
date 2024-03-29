import {JSDOM} from "jsdom"
import FsProxy from "../../src/fsProxy"
import {stub} from "sinon"
import {AssetUploader} from "../../src/assetMigrators/AssetUploader"
import axios from "axios"
import { expect } from "chai"

describe("_uploadAsset", () => {
	it("should upload a file", async () => {
		const file = Buffer.from("hello")
		const axiosInstance = axios.create()
		const url = "https://imagedelivery.net/fakeHash_190376479142_0/public"
		const strapiToken = "apiToken"

		stub(axiosInstance, "post").withArgs(
			"/upload",
			{files: [file]},
			{
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': `bearer ${strapiToken}`
				}
			}
		).resolves({data: {properties: {url}}})

		const filename = "file:///Users/test/tumblr-export/media/673954189579288576_0.png"

		const fs = new FsProxy()

		stub(fs, "readFileSync").withArgs(filename).returns(file)

		const assetUploader =
			new AssetUploader(axiosInstance, fs, strapiToken)

		expect((await assetUploader.uploadAsset(filename)))
			.to.eq(url)
	})
})
