import {main} from "main"
import SquarespaceImporter from "SquarespaceImporter"
import * as fs from "fs"
import {buildStrapi} from "StrapiFactory"
import {buildStrapiExporter} from "StrapiExporterFactory"

const squarespaceImporter = new SquarespaceImporter()

main(process.argv, fs, squarespaceImporter, buildStrapi, buildStrapiExporter)
