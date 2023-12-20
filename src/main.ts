import SquarespaceImporter from "SquarespaceImporter"
import minimist from "minimist"
import FsProxy from "fsProxy"
import {StrapiFactory} from "StrapiFactory"
import {StrapiExporterFactory} from "StrapiExporterFactory"

const main = async (
	argv: string[],
	fsProxy: FsProxy,
	squarespaceImporter: SquarespaceImporter,
	buildStrapi: StrapiFactory,
	buildStrapiExporter: StrapiExporterFactory
) => {
	const options = minimist(argv, {
		alias: {
			s: 'squarespace',
			t: 'strapi'
		}
	})

	if (!options.strapi) throw new Error('Strapi server unspecified.')
	const strapi = buildStrapi({ url: options.strapi })

	if (options.squarespace) {
		const dataContainer = squarespaceImporter.import(
			fsProxy.readFileSync(
				options.squarespace
			).toString()
		)

		const strapiExporter = buildStrapiExporter(strapi)

		await strapiExporter.export(dataContainer.posts)
	}
}

export {
	main
}
