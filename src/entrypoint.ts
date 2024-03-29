import {main} from "main"
import {importSquarespace} from "./importers/SquarespaceImporter"
import * as fs from "fs"
import {buildStrapi} from "factories/StrapiFactory"
import {buildStrapiExporter} from "factories/StrapiExporterFactory"
import {validateArgv} from "lib/validateArgv"
import {collateDataContainer} from "DataContainerCollater"
import {readTumblrPosts} from "lib/readTumblrPosts"
import {importTumblr} from "importers/TumblrImporter"
import {buildAxios} from "factories/AxiosFactory"
import {buildTumblrAssetMigrator} from "factories/TumblrAssetMigratorFactory"
import {buildSquarespaceAssetMigrator} from "factories/SquarespaceAssetMigratorFactory"
import {buildAssetUploader} from "factories/AssetUploaderFactory"
import readline from "readline/promises"
import {argv, stdin, stdout} from "process"

main(
	argv,
	validateArgv,
	fs,
	readline.createInterface({
		input: stdin,
		output: stdout
	}),
	importSquarespace,
	readTumblrPosts,
	importTumblr,
	collateDataContainer,
	buildStrapi,
	buildStrapiExporter,
	buildAxios,
	buildTumblrAssetMigrator,
	buildSquarespaceAssetMigrator,
	buildAssetUploader
)
