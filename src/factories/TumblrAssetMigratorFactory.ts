import { AxiosInstance } from "axios";
import FsProxy from "fsProxy"
import {TumblrAssetMigrator} from "assetMigrators/TumblrAssetMigrator"
import {AssetMigratorFactory} from "types/AssetMigratorFactory"

export const buildTumblrAssetMigrator: AssetMigratorFactory = (
	axios: AxiosInstance,
	fsProxy: FsProxy,
	directory: string
) =>
		new TumblrAssetMigrator(axios, fsProxy, directory)
