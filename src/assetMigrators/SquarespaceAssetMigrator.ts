import {JSDOM} from "jsdom"
import {AxiosInstance} from "axios"
import FsProxy from "fsProxy"
import {Article} from "types/Article"
import {promiseSequence} from "../lib/util"
import * as path from "path"
import {URL} from "url"
import {AssetUploader} from "assetMigrators/AssetUploader"
import {AssetMigrator} from "assetMigrators/AssetMigrator"

export class SquarespaceAssetMigrator implements AssetMigrator {
	private axios: AxiosInstance
	private fs: FsProxy
	private cacheDir: string
	private assetUploader: AssetUploader

	constructor(
		axios: AxiosInstance,
		fs: FsProxy,
		cacheDir: string,
		assetUploader: AssetUploader
	) {
		this.axios = axios
		this.fs = fs
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
		await promiseSequence(Array.from(
			body.querySelectorAll(gallerySelector)
		).map(async (gallery) => {
			const galleryItems = (await promiseSequence(
				Array.from(
					gallery.querySelectorAll<HTMLImageElement>("noscript img")
				).map(async (img) => {
					const cachedPath = await this._downloadAsset(img.src)
					img.src = await this.assetUploader.uploadAsset(cachedPath)
					this.fs.unlinkSync(cachedPath)
					return img
				})
			)).map(galleryItemGetter).join("\n")

			gallery.outerHTML = `<div class="${galleryClass}">
	${galleryItems}
</div>`
		}))
	}

	_downloadAsset = async (url: string): Promise<string> => {
		const cachedPath = path.join(
			this.cacheDir,
			path.parse(new URL(url).pathname).base
		);

		this.fs.writeFileSync(
			cachedPath,
			(await this.axios.get(url, { responseType: 'arraybuffer' })).data
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
