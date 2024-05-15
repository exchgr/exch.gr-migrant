import {
	SquarespaceAssetMigrator
} from "../assetMigrators/SquarespaceAssetMigrator"
import {AssetUploader} from "assetMigrators/AssetUploader"

export type SquarespaceAssetMigratorFactory = (
	directory: string,
	assetUploader: AssetUploader
) => SquarespaceAssetMigrator

export const buildSquarespaceAssetMigrator: SquarespaceAssetMigratorFactory = (
	filename,
	assetUploader
) =>
	new	SquarespaceAssetMigrator(filename, assetUploader)
