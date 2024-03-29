import FsProxy from "fsProxy"
import {AssetUploader} from "../assetMigrators/AssetUploader"

export type AssetUploaderFactory = (
	strapiUrl: string,
	fetche: typeof fetch,
	fs: FsProxy,
	strapiToken: string
) => AssetUploader

export const buildAssetUploader: AssetUploaderFactory = (
	strapiUrl,
	fetche,
	fs,
	strapiToken
) =>
	new AssetUploader(strapiUrl, fetche, fs, strapiToken)
