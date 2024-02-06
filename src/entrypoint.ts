import {main} from "main"
import {importSquarespace} from "./importers/SquarespaceImporter"
import * as fs from "fs"
import {buildStrapi} from "factories/StrapiFactory"
import {buildStrapiExporter} from "factories/StrapiExporterFactory"
import {validateArgv} from "lib/validateArgv"
import {collateDataContainer} from "DataContainerCollater"
import {readTumblrPosts} from "lib/readTumblrPosts"
import {importTumblr} from "importers/TumblrImporter"

main(
	process.argv,
	validateArgv,
	fs,
	importSquarespace,
	readTumblrPosts,
	importTumblr,
	collateDataContainer,
	buildStrapi,
	buildStrapiExporter
)
