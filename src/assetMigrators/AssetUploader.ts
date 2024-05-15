import {objectToFormData} from "../lib/util"
import * as path from "path"
import fs from "fs"

export class AssetUploader {
	private strapiUrl: string
	private strapiToken: string

	constructor(
		strapiUrl: string,
		strapiToken: string
	) {
		this.strapiUrl = strapiUrl
		this.strapiToken = strapiToken
	}

	uploadAsset = async (
		filename: string
	): Promise<string> => {
		const response = await fetch(
			new URL("/api/upload", this.strapiUrl),
			{
				method: 'post',
				body: objectToFormData({
					"files": {
						file: await fs.openAsBlob(_sanitizePath(filename)),
						filename: path.parse(filename).base
					}
				}),
				headers: {
					'Authorization': `bearer ${this.strapiToken}`
				}
			}
		)

		if (!response.ok) {
			const {error} = await response.json()
			throw new Error(`Error: ${response.status} ${response.statusText}
${error.name}: ${error.message}`)
		}

		return (await response.json())[0].url
	}
}

export const _sanitizePath = (filePath: string) =>
	filePath.match(/^file:\/\//) ? new URL(filePath).pathname : filePath
