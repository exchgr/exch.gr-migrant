import {SquarespaceAssetMigrator} from "assetMigrators/SquarespaceAssetMigrator"
import FsProxy from "fsProxy"
import {AssetMigrator} from "assetMigrators/AssetMigrator"
import {AxiosInstance} from "axios"
import {AssetUploader} from "assetMigrators/AssetUploader"

export type SquarespaceAssetMigratorFactory = (
	axios: AxiosInstance,
	fsProxy: FsProxy,
	directory: string,
	assetUploader: AssetUploader
) => SquarespaceAssetMigrator

export const buildSquarespaceAssetMigrator: SquarespaceAssetMigratorFactory = (
	axios,
	fsProxy,
	filename,
	assetUploader
) =>
	new	SquarespaceAssetMigrator(axios, fsProxy, filename, assetUploader)
