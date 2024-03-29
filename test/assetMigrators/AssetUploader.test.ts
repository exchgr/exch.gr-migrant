import FsProxy from "../../src/fsProxy"
import {createStubInstance, stub} from "sinon"
import {AssetUploader, _sanitizePath} from "../../src/assetMigrators/AssetUploader"
import {expect} from "chai"
import {objectToFormData} from "../../src/lib/util"
import {URL} from "url"

describe("_uploadAsset", () => {
	it("should upload a file", async () => {
		const filename = "673954189579288576_0.png"
		const filePath = `/Users/test/tumblr-export/media/${filename}`
		const fileUrl = `file://${filePath}`
		const file = new Blob(["hi"])

		const strapi = "http://localhost:1337"
		const url = "https://imagedelivery.net/fakeHash_190376479142_0/public"
		const strapiToken = "apiToken"
		const response = {
			ok: true,
			json: async () => [{url}]
		}

		const fetche = stub()
			.withArgs(
				new URL("/api/upload", strapi),
				{
					method: 'post',
					body: objectToFormData({files: {file, filename}}),
					headers: {'Authorization': `bearer ${strapiToken}`}
				}
			).resolves(response)

		const fsProxy = new FsProxy()
		stub(fsProxy, "openAsBlob").withArgs(filePath).resolves(file)

		const assetUploader = new AssetUploader(
			strapi,
			fetche,
			fsProxy,
			strapiToken
		)

		expect((await assetUploader.uploadAsset(fileUrl)))
			.to.eq(url)
	})

	describe("_sanitizePath", () => {
		it("should convert a file:// path to a regular path", () => {
			const filePath =
				`/Users/test/tumblr-export/media/673954189579288576_0.png`

			const fileUrl = `file://${filePath}`

			expect(_sanitizePath(fileUrl)).to.eq(filePath)
		})

		it("should do nothing to a regular path", () => {
			const filePath =
				`/Users/test/tumblr-export/media/673954189579288576_0.png`

			expect(_sanitizePath(filePath)).to.eq(filePath)
		})
	})
})
