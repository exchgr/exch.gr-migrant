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

main(
	process.argv,
	validateArgv,
	fs,
	importSquarespace,
	readTumblrPosts,
	importTumblr,
	collateDataContainer,
	buildStrapi,
	buildStrapiExporter,
	buildAxios,
	buildTumblrAssetMigrator
)
