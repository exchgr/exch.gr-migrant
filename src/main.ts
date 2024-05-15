import {StrapiExporterFactory} from "factories/StrapiExporterFactory"
import {importTumblr} from "./importers/TumblrImporter"
import {validateArgv} from "./lib/validateArgv"
import {DatumContainer} from "types/DatumContainer"
import {collateDataContainer} from "./DataContainerCollater"
import {readTumblrPosts} from "./lib/readTumblrPosts"
import {importSquarespace} from "./importers/SquarespaceImporter"
import {TumblrAssetMigratorFactory} from "factories/TumblrAssetMigratorFactory"
import {syncMap} from "./lib/util"
import {
	SquarespaceAssetMigratorFactory
} from "factories/SquarespaceAssetMigratorFactory"
import {AssetUploaderFactory} from "factories/AssetUploaderFactory"
import readline from "readline/promises"
import fs from "fs"
import {stdin, stdout, argv} from "process"

const main = async (
	buildStrapiExporter: StrapiExporterFactory,
	buildTumblrAssetMigrator: TumblrAssetMigratorFactory,
	buildSquarespaceAssetMigrator: SquarespaceAssetMigratorFactory,
	buildAssetUploader: AssetUploaderFactory
) => {
	const options = validateArgv(argv)

	const rl = readline.createInterface({
		input: stdin,
		output: stdout
	})

	const strapiToken = await rl.question(`1. Go to ${options.strapi}/admin/settings/api-tokens
2. Create an API token
3. Paste the API token here and press [return]: `)

	const strapiExporter = buildStrapiExporter(options.strapi, strapiToken)
	const assetUploader = buildAssetUploader(options.strapi, strapiToken)

	const datumContainers: DatumContainer[] = []

	if (options.squarespace) {
		const squarespaceAssetMigrator = buildSquarespaceAssetMigrator(
			options.cacheDirectory,
			assetUploader
		)

		datumContainers.push.apply(
			datumContainers,
			await syncMap(
				importSquarespace(
					fs.readFileSync(
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
					readTumblrPosts(options.tumblr)
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
