import {JSDOM} from "jsdom"
import {AxiosInstance} from "axios"
import FsProxy from "fsProxy"
import {AssetMigrator} from "assetMigrators/AssetMigrator"
import {Article} from "types/Article"
import {promiseSequence} from "../lib/util"

export class TumblrAssetMigrator implements AssetMigrator {
	private axios: AxiosInstance
	private fs: FsProxy
	private directory: string

	constructor(
		axios: AxiosInstance,
		fs: FsProxy,
		directory: string
	) {
		this.axios = axios
		this.fs = fs
		this.directory = directory
	}

	migrateAssets = async (article: Article): Promise<Article> => {
		const body = new JSDOM(
			article.body,
			{
				contentType: "text/html",
				url: `file://${this.directory}`
			}
		).window.document.body

		await promiseSequence(Array.from(body.querySelectorAll("img"))
			.map(this._uploadAsset)
		)

		article.body = body.innerHTML

		//   for each image:
		//     1. determine whether file is local or remote (polymorphism)
		//     2. local: leave it there, but get absolute path.  - DONE AUTOMATICALLY BY JSDOM
		//     2a. remote: copy it to local cache
		//     3. upload from location on disk, agnostic of where it is. return: new remote url - DONE
		//     4. replace img src with new remote url - DONE
		//     5. remote: delete local copy.
		//     5a. local: leave intact - DONE
		return article
	}

	_uploadAsset = async (img: HTMLImageElement): Promise<HTMLImageElement> => {
		img.src = (await this.axios.post(
			"/upload",
			{
				files: [this.fs.readFileSync(img.src)]
			}, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
		)).data.properties.url

		return img
	}
}
