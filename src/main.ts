import FsProxy from "fsProxy"
import {StrapiExporterFactory} from "factories/StrapiExporterFactory"
import {TumblrImporter} from "./importers/TumblrImporter"
import {ValidateArgv} from "lib/validateArgv"
import {DatumContainer} from "types/DatumContainer"
import {DataContainerCollater} from "DataContainerCollater"
import {ReadTumblrPosts} from "lib/readTumblrPosts"
import {SquarespaceImporter} from "importers/SquarespaceImporter"
import {TumblrAssetMigratorFactory} from "factories/TumblrAssetMigratorFactory"
import {syncMap} from "./lib/util"
import {
	SquarespaceAssetMigratorFactory
} from "factories/SquarespaceAssetMigratorFactory"
import {AssetUploaderFactory} from "factories/AssetUploaderFactory"
import readline from "readline/promises"

const main = async (
	argv: string[],
	validateArgv: ValidateArgv,
	fsProxy: FsProxy,
	rl: readline.Interface,
	importSquarespace: SquarespaceImporter,
	readTumblrPosts: ReadTumblrPosts,
	importTumblr: TumblrImporter,
	collateDataContainer: DataContainerCollater,
	buildStrapiExporter: StrapiExporterFactory,
	buildTumblrAssetMigrator: TumblrAssetMigratorFactory,
	buildSquarespaceAssetMigrator: SquarespaceAssetMigratorFactory,
	buildAssetUploader: AssetUploaderFactory
) => {
	const options = validateArgv(argv, fsProxy)

	const strapiToken = await rl.question(`1. Go to ${options.strapi}/admin/settings/api-tokens
2. Create an API token
3. Paste the API token here and press [return]: `)

	const strapiExporter = buildStrapiExporter(fetch, options.strapi, strapiToken)
	const assetUploader = buildAssetUploader(options.strapi, fetch, fsProxy, strapiToken)

	const datumContainers: DatumContainer[] = []

	if (options.squarespace) {
		const squarespaceAssetMigrator = buildSquarespaceAssetMigrator(
			fetch,
			fsProxy,
			options.cacheDirectory,
			assetUploader
		)

		datumContainers.push.apply(
			datumContainers,
			await syncMap(
				importSquarespace(
					fsProxy.readFileSync(
						options.squarespace
					).toString()
				),
				async (datumContainer) => (
					datumContainer.article = await squarespaceAssetMigrator.migrateAssets(datumContainer.article),
						datumContainer
				)
			)
		)
	}

	if (options.tumblr) {
		const tumblrAssetMigrator = buildTumblrAssetMigrator(
			options.tumblr,
			assetUploader
		)

		datumContainers.push.apply(
			datumContainers,
			await syncMap(
				importTumblr(
					readTumblrPosts(fsProxy, options.tumblr)
				), async (datumContainer) => (
					datumContainer.article = await tumblrAssetMigrator.migrateAssets(datumContainer.article),
						datumContainer
				)
			)
		)
	}

	await strapiExporter.export(
		collateDataContainer(datumContainers)
	)

	rl.close()
}

export {
	main
}
