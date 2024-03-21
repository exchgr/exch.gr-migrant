import { AxiosInstance } from "axios";
import FsProxy from "fsProxy"
import {TumblrAssetMigrator} from "assetMigrators/TumblrAssetMigrator"
import {AssetUploader} from "assetMigrators/AssetUploader"
import {AssetMigrator} from "assetMigrators/AssetMigrator"

export type TumblrAssetMigratorFactory = (
	directory: string,
	assetUploader: AssetUploader
) => AssetMigrator

export const buildTumblrAssetMigrator: TumblrAssetMigratorFactory = (
	directory: string,
	assetUploader: AssetUploader
) =>
		new TumblrAssetMigrator(directory, assetUploader)
