import {
	SquarespaceAssetMigrator
} from "../assetMigrators/SquarespaceAssetMigrator"
import FsProxy from "fsProxy"
import {AssetUploader} from "assetMigrators/AssetUploader"

export type SquarespaceAssetMigratorFactory = (
	fetche: typeof fetch,
	fsProxy: FsProxy,
	directory: string,
	assetUploader: AssetUploader
) => SquarespaceAssetMigrator

export const buildSquarespaceAssetMigrator: SquarespaceAssetMigratorFactory = (
	fetche,
	fsProxy,
	filename,
	assetUploader
) =>
	new	SquarespaceAssetMigrator(fetche, fsProxy, filename, assetUploader)
