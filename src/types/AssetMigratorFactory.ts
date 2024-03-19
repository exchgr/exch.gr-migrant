import FsProxy from "fsProxy"
import {AxiosInstance} from "axios"
import {AssetMigrator} from "assetMigrators/AssetMigrator"

export type AssetMigratorFactory = (axios: AxiosInstance, fsProxy: FsProxy, directory: string) => AssetMigrator
