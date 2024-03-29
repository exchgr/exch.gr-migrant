import { AxiosInstance } from "axios";
import FsProxy from "fsProxy"
import {AssetUploader} from "assetMigrators/AssetUploader"

export type AssetUploaderFactory = (
	axios: AxiosInstance,
	fs: FsProxy,
	strapiToken: string
) => AssetUploader

export const buildAssetUploader: AssetUploaderFactory = (
	axios,
	fs,
	strapiToken
) =>
	new AssetUploader(axios, fs, strapiToken)
