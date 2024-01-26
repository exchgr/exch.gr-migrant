import SquarespaceImporter from "SquarespaceImporter"
import FsProxy from "fsProxy"
import {StrapiFactory} from "StrapiFactory"
import {StrapiExporterFactory} from "StrapiExporterFactory"
import TumblrImporter from "TumblrImporter"
import {ValidateArgv} from "lib/validateArgv"
import {DatumContainer} from "types/DatumContainer"
import {DataContainerCollater} from "DataContainerCollater"
import {ReadTumblrPosts} from "lib/readTumblrPosts"

const main = async (
	argv: string[],
	validateArgv: ValidateArgv,
	fsProxy: FsProxy,
	squarespaceImporter: SquarespaceImporter,
	readTumblrPosts: ReadTumblrPosts,
	tumblrImporter: TumblrImporter,
	dataContainerCollater: DataContainerCollater,
	buildStrapi: StrapiFactory,
	buildStrapiExporter: StrapiExporterFactory
) => {
	const options = validateArgv(argv, fsProxy)
	const strapi = buildStrapi({ url: options.strapi })
	const strapiExporter = buildStrapiExporter(strapi)
	const datumContainers: DatumContainer[][] = []

	if (options.squarespace) {
		datumContainers.push(squarespaceImporter.import(
			fsProxy.readFileSync(
				options.squarespace
			).toString()
		))
	}

	if (options.tumblr) {
		datumContainers.push(tumblrImporter.import(
			readTumblrPosts(fsProxy, options.tumblr)
		))
	}

	await strapiExporter.export(
		dataContainerCollater.collate(
			datumContainers.flat()
		)
	)
}

export {
	main
}
