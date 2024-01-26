import {main} from "main"
import SquarespaceImporter from "SquarespaceImporter"
import * as fs from "fs"
import {buildStrapi} from "StrapiFactory"
import {buildStrapiExporter} from "StrapiExporterFactory"
import TumblrImporter from "TumblrImporter"
import {validateArgv} from "lib/validateArgv"
import {DataContainerCollater} from "DataContainerCollater"
import {readTumblrPosts} from "lib/readTumblrPosts"

const squarespaceImporter = new SquarespaceImporter()
const tumblrImporter = new TumblrImporter()
const dataContainerCollater = new DataContainerCollater()

main(
	process.argv,
	validateArgv,
	fs,
	squarespaceImporter,
	readTumblrPosts,
	tumblrImporter,
	dataContainerCollater,
	buildStrapi,
	buildStrapiExporter
)
