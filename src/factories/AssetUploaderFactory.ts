import { AxiosInstance } from "axios";
import FsProxy from "fsProxy"
import {AssetUploader} from "assetMigrators/AssetUploader"

export type AssetUploaderFactory = (axios: AxiosInstance, fs: FsProxy) => AssetUploader

export const buildAssetUploader: AssetUploaderFactory = (axios, fs) =>
	new AssetUploader(axios, fs)
