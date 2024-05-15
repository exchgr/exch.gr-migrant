import {JSDOM} from "jsdom"
import {Article} from "types/Article"
import {syncMap} from "../lib/util"
import * as path from "path"
import {URL} from "url"
import {AssetUploader} from "assetMigrators/AssetUploader"
import {AssetMigrator} from "assetMigrators/AssetMigrator"
import fs from "fs"

export class SquarespaceAssetMigrator implements AssetMigrator {
	private cacheDir: string
	private assetUploader: AssetUploader

	constructor(
		cacheDir: string,
		assetUploader: AssetUploader
	) {
		this.cacheDir = cacheDir
		this.assetUploader = assetUploader
	}

	migrateAssets = async (article: Article): Promise<Article> => {
		const body = new JSDOM(
			article.body,
			{
				contentType: "text/html",
				url: "https://localhost"
			}
		).window.document.body

		await this._replaceGalleries(
			body,
			".sqs-gallery-block-stacked",
			"grid-gallery", // changing to grid because I feel like it
			_renderStackedGalleryItem
		)

		await this._replaceGalleries(
			body,
			".sqs-gallery-block-grid",
			"grid-gallery",
			_renderGridGalleryItem
		)

		article.body = body.outerHTML

		return article
	}

	_replaceGalleries = async (
		body: HTMLElement,
		gallerySelector: string,
		galleryClass: string,
		galleryItemGetter: (img: HTMLImageElement) => string
	) => {
		await syncMap(
			Array.from(body.querySelectorAll(gallerySelector)),
			async (gallery) => {
				const galleryItems = (await syncMap(
					Array.from(gallery.querySelectorAll<HTMLImageElement>("noscript img")),
					async (img) => {
						const cachedPath = await this._downloadAsset(img.src)
						img.src = await this.assetUploader.uploadAsset(cachedPath)
						fs.unlinkSync(cachedPath)
						return img
					}
				)).map(galleryItemGetter).join("\n")

				gallery.outerHTML = `<div class="${galleryClass}">
	${galleryItems}
</div>`
			}
		)
	}

	_downloadAsset = async (url: string): Promise<string> => {
		const cachedPath = path.join(
			this.cacheDir,
			path.parse(new URL(url).pathname).base
		)

		fs.writeFileSync(
			cachedPath,
			Buffer.from(await (await fetch(url)).arrayBuffer())
		)

		return cachedPath
	}
}

export const _renderStackedGalleryItem = (img: HTMLImageElement): string =>
	`<a href="${img.src}">${img.outerHTML}</a>`

export const _renderGridGalleryItem = (img: HTMLImageElement): string =>
	`<figure>
	<a href="${img.src}">
		${img.outerHTML}
	</a>
	<figcaption>${img.alt}</figcaption>
</figure>`
