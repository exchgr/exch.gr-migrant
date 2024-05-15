import {AssetUploader} from "../assetMigrators/AssetUploader"

export type AssetUploaderFactory = (
	strapiUrl: string,
	strapiToken: string
) => AssetUploader

export const buildAssetUploader: AssetUploaderFactory = (
	strapiUrl,
	strapiToken
) =>
	new AssetUploader(strapiUrl, strapiToken)
