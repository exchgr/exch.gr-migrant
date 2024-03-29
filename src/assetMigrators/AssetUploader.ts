import { AxiosInstance } from "axios"
import FsProxy from "fsProxy"

export class AssetUploader {
	private axios: AxiosInstance
	private fs: FsProxy
	private strapiToken: string

	constructor(
		axios: AxiosInstance,
		fs: FsProxy,
		strapiToken: string
	) {
		this.axios = axios
		this.fs = fs
		this.strapiToken = strapiToken
	}

	uploadAsset = async (
		filename: string
	): Promise<string> => (
		(await this.axios.post(
			"/api/upload",
			{
				files: [this.fs.readFileSync(filename)]
			}, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': `bearer ${this.strapiToken}`
				}
			}
		)).data.properties.url
	)
}
