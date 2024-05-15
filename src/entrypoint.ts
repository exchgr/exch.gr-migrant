import {main} from "./main"
import {buildStrapiExporter} from "./factories/StrapiExporterFactory"
import {collateDataContainer} from "./DataContainerCollater"
import {buildTumblrAssetMigrator} from "./factories/TumblrAssetMigratorFactory"
import {
	buildSquarespaceAssetMigrator
} from "./factories/SquarespaceAssetMigratorFactory"
import {buildAssetUploader} from "./factories/AssetUploaderFactory"

main(
	buildStrapiExporter,
	buildTumblrAssetMigrator,
	buildSquarespaceAssetMigrator,
	buildAssetUploader
)
