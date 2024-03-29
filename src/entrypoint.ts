import {main} from "./main"
import {importSquarespace} from "./importers/SquarespaceImporter"
import {buildStrapiExporter} from "./factories/StrapiExporterFactory"
import {validateArgv} from "./lib/validateArgv"
import {collateDataContainer} from "./DataContainerCollater"
import {readTumblrPosts} from "./lib/readTumblrPosts"
import {importTumblr} from "./importers/TumblrImporter"
import {buildTumblrAssetMigrator} from "./factories/TumblrAssetMigratorFactory"
import {buildSquarespaceAssetMigrator} from "./factories/SquarespaceAssetMigratorFactory"
import {buildAssetUploader} from "./factories/AssetUploaderFactory"
import readline from "readline/promises"
import {argv, stdin, stdout} from "process"
import FsProxy from "./fsProxy"

main(
	argv,
	validateArgv,
	new FsProxy(),
	readline.createInterface({
		input: stdin,
		output: stdout
	}),
	importSquarespace,
	readTumblrPosts,
	importTumblr,
	collateDataContainer,
	buildStrapiExporter,
	buildTumblrAssetMigrator,
	buildSquarespaceAssetMigrator,
	buildAssetUploader
)
