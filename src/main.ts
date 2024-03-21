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
import {TumblrAssetMigratorFactory} from "factories/TumblrAssetMigratorFactory"
import {promiseSequence} from "./lib/util"
import {
	SquarespaceAssetMigratorFactory
} from "factories/SquarespaceAssetMigratorFactory"
import {AssetUploaderFactory} from "factories/AssetUploaderFactory"

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
	buildTumblrAssetMigrator: TumblrAssetMigratorFactory,
	buildSquarespaceAssetMigrator: SquarespaceAssetMigratorFactory,
	buildAssetUploader: AssetUploaderFactory
) => {
	const options = validateArgv(argv, fsProxy)
	const strapi = buildStrapi({ url: options.strapi })
	const axios = buildAxios(options.strapi)
	const strapiExporter = buildStrapiExporter(strapi)
	const assetUploader = buildAssetUploader(axios, fsProxy)

	const tumblrAssetMigrator = buildTumblrAssetMigrator(
		options.tumblr,
		assetUploader
	)

	const squarespaceAssetMigrator = buildSquarespaceAssetMigrator(
		axios,
		fsProxy,
		options.cacheDirectory,
		assetUploader
	)

	const datumContainers: DatumContainer[] = []

	if (options.squarespace) {
		datumContainers.push.apply(
			datumContainers,
			await promiseSequence(importSquarespace(
				fsProxy.readFileSync(
					options.squarespace
				).toString()
			).map(async (datumContainer) => (
				datumContainer.article = await squarespaceAssetMigrator.migrateAssets(datumContainer.article),
					datumContainer
				))
			)
		)
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
