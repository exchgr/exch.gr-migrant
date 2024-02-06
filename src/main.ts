import FsProxy from "fsProxy"
import {StrapiFactory} from "factories/StrapiFactory"
import {StrapiExporterFactory} from "factories/StrapiExporterFactory"
import {TumblrImporter} from "./importers/TumblrImporter"
import {ValidateArgv} from "lib/validateArgv"
import {DatumContainer} from "types/DatumContainer"
import {DataContainerCollater} from "DataContainerCollater"
import {ReadTumblrPosts} from "lib/readTumblrPosts"
import {SquarespaceImporter} from "importers/SquarespaceImporter"

const main = async (
	argv: string[],
	validateArgv: ValidateArgv,
	fsProxy: FsProxy,
	importSquarespace: SquarespaceImporter,
	readTumblrPosts: ReadTumblrPosts,
	importTumblr: TumblrImporter,
	collateDataContainer: DataContainerCollater,
	buildStrapi: StrapiFactory,
	buildStrapiExporter: StrapiExporterFactory
) => {
	const options = validateArgv(argv, fsProxy)
	const strapi = buildStrapi({ url: options.strapi })
	const strapiExporter = buildStrapiExporter(strapi)
	const datumContainers: DatumContainer[][] = []

	if (options.squarespace) {
		datumContainers.push(importSquarespace(
			fsProxy.readFileSync(
				options.squarespace
			).toString()
		))
	}

	if (options.tumblr) {
		datumContainers.push(importTumblr(
			readTumblrPosts(fsProxy, options.tumblr)
		))
	}

	await strapiExporter.export(
		collateDataContainer(
			datumContainers.flat()
		)
	)
}

export {
	main
}
