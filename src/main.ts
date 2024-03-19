import FsProxy from "fsProxy"
import {StrapiFactory} from "factories/StrapiFactory"
import {StrapiExporterFactory} from "factories/StrapiExporterFactory"
import {TumblrImporter} from "./importers/TumblrImporter"
import {ValidateArgv} from "lib/validateArgv"
import {DatumContainer} from "types/DatumContainer"
import {DataContainerCollater} from "DataContainerCollater"
import {ReadTumblrPosts} from "lib/readTumblrPosts"
import {SquarespaceImporter} from "importers/SquarespaceImporter"
import {AxiosFactory} from "factories/AxiosFactory"
import {AssetMigratorFactory} from "types/AssetMigratorFactory"
import {promiseSequence} from "./lib/util"

const main = async (
	argv: string[],
	validateArgv: ValidateArgv,
	fsProxy: FsProxy,
	importSquarespace: SquarespaceImporter,
	readTumblrPosts: ReadTumblrPosts,
	importTumblr: TumblrImporter,
	collateDataContainer: DataContainerCollater,
	buildStrapi: StrapiFactory,
	buildStrapiExporter: StrapiExporterFactory,
	buildAxios: AxiosFactory,
	buildTumblrAssetMigrator: AssetMigratorFactory
) => {
	const options = validateArgv(argv, fsProxy)
	const strapi = buildStrapi({ url: options.strapi })
	const axios = buildAxios(options.strapi)
	const strapiExporter = buildStrapiExporter(strapi)
	const tumblrAssetMigrator = buildTumblrAssetMigrator(axios, fsProxy, options.tumblr)
	const datumContainers: DatumContainer[] = []

	if (options.squarespace) {
		datumContainers.push.apply(datumContainers, importSquarespace(
			fsProxy.readFileSync(
				options.squarespace
			).toString()
		))
	}

	if (options.tumblr) {
		datumContainers.push.apply(
			datumContainers,
			await promiseSequence(importTumblr(
				readTumblrPosts(fsProxy, options.tumblr)
			).map(async (datumContainer) => (
				datumContainer.article = await tumblrAssetMigrator.migrateAssets(datumContainer.article),
						datumContainer
				))
			)
		)
	}

	await strapiExporter.export(
		collateDataContainer(datumContainers)
	)
}

export {
	main
}
