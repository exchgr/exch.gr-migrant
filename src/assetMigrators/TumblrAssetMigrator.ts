import {JSDOM} from "jsdom"
import {AssetMigrator} from "assetMigrators/AssetMigrator"
import {Article} from "types/Article"
import {syncMap} from "../lib/util"
import {AssetUploader} from "assetMigrators/AssetUploader"

export class TumblrAssetMigrator implements AssetMigrator {
	private directory: string
	private assetUploader: AssetUploader

	constructor(
		directory: string,
		assetUploader: AssetUploader
	) {
		this.directory = directory
		this.assetUploader = assetUploader
	}

	migrateAssets = async (article: Article): Promise<Article> => {
		const body = new JSDOM(
			article.body,
			{
				contentType: "text/html",
				url: `file://${this.directory}`
			}
		).window.document.body

		await syncMap(
			Array.from(body.querySelectorAll("img")),
			async (img) =>
				img.src = await this.assetUploader.uploadAsset(img.src)
		)

		article.body = body.innerHTML

		return article
	}
}
