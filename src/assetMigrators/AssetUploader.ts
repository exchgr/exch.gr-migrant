import { AxiosInstance } from "axios"
import FsProxy from "fsProxy"

export class AssetUploader {
	private axios: AxiosInstance
	private fs: FsProxy

	constructor(
		axios: AxiosInstance,
		fs: FsProxy
	) {
		this.axios = axios
		this.fs = fs
	}

	uploadAsset = async (
		filename: string
	): Promise<string> => (
		(await this.axios.post(
			"/upload",
			{
				files: [this.fs.readFileSync(filename)]
			}, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
		)).data.properties.url
	)
}
