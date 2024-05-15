import {JSDOM} from "jsdom"
import chai, {expect} from 'chai'
import {main} from "../src/main"
import {createStubInstance, restore, SinonStub, spy, stub} from "sinon"
import sinonChai from "sinon-chai"
import chaiAsPromised from "chai-as-promised"
import {StrapiExporter} from "../src/exporters/StrapiExporter"
import {DataContainer} from "../src/types/DataContainer"
import * as validateArgv from "../src/lib/validateArgv"
import {DatumContainer} from "../src/types/DatumContainer"
import * as DataContainerCollater from "../src/DataContainerCollater"
import {TumblrPost} from "../src/types/TumblrPost"
import * as SquarespaceImporter from "../src/importers/SquarespaceImporter"
import * as TumblrImporter from "../src/importers/TumblrImporter"
import {StrapiExporterFactory} from "../src/factories/StrapiExporterFactory"
import {
	TumblrAssetMigratorFactory
} from "../src/factories/TumblrAssetMigratorFactory"
import {TumblrAssetMigrator} from "../src/assetMigrators/TumblrAssetMigrator"
import {
	SquarespaceAssetMigrator
} from "../src/assetMigrators/SquarespaceAssetMigrator"
import {AssetUploader} from "../src/assetMigrators/AssetUploader"
import {AssetUploaderFactory} from "../src/factories/AssetUploaderFactory"
import {
	SquarespaceAssetMigratorFactory
} from "../src/factories/SquarespaceAssetMigratorFactory"
import readline from "readline/promises"
import {stdin, stdout} from "process"
import fs from "fs"
import {Abortable} from "events"
import * as ReadTumblrPosts from "../src/lib/readTumblrPosts"

chai.use(sinonChai)
chai.use(chaiAsPromised)

const strapiUrl = "http://localhost:1337"

describe("main", () => {
	afterEach(restore)

	it("should process an existing squarespace export xml and export to strapi", async () => {
		const squarespaceFilename = 'resources/Squarespace-Wordpress-Export-10-12-2023.xml';
		const squarespaceData = "hi"
		const tumblrDirectory = "here"
		stub(fs, "readFileSync").withArgs(squarespaceFilename).returns(Buffer.from(squarespaceData))

		global.process.argv = [
			'-s', squarespaceFilename,
			'-t', tumblrDirectory,
			'-r', strapiUrl
		]

		const strapiToken = "apiToken"

		const rl = createStubInstance(readline.Interface, {
			question: stub().withArgs(`1. Go to ${strapiUrl}/admin/settings/api-tokens
2. Create an API token
3. Paste the API token here and press [return]: `
			).resolves(strapiToken) as SinonStub<[query: string, options: Abortable], Promise<string>>,
		})

		stub(readline, "createInterface").withArgs({
			input: stdin,
			output: stdout
		}).returns(rl)

		const pubDate = new Date()

		const squarespaceArticle = {
			title: "hi",
			body: "hi",
			createdAt: pubDate,
			publishedAt: pubDate,
			updatedAt: pubDate,
			slug: "hi",
			author: "elle mundy",
			og_type: "article",
		}

		const squarespaceDatumContainers: DatumContainer[] = [
			{
				article: squarespaceArticle,
				tags: [
					{
						name: "hi",
						slug: "hi"
					}
				],
				collection: {
					name: "Photography",
					slug: "photography"
				},
				redirect: {
					from: "/fotoblog/hi",
					httpCode: 301
				}
			}
		]

		const importSquarespace = stub(SquarespaceImporter, "importSquarespace").returns(
			squarespaceDatumContainers
		)

		const tumblrPosts: TumblrPost[] = [
			{
				id: "1",
				dom: new JSDOM("hey").window.document
			},
			{
				id: "2",
				dom: new JSDOM("hi").window.document
			}
		]

		stub(ReadTumblrPosts, "readTumblrPosts")
			.withArgs(tumblrDirectory).returns(tumblrPosts)

		const tumblrArticle = {
			title: "hey",
			body: "hey",
			createdAt: pubDate,
			publishedAt: pubDate,
			updatedAt: pubDate,
			slug: "hey",
			author: "elle mundy",
			og_type: "article",
		}

		const tumblrDatumContainers: DatumContainer[] = [
			{
				article: tumblrArticle,
				tags: [
					{
						name: "hi",
						slug: "hi"
					},
					{
						name: "hey",
						slug: "hey"
					}
				],
				collection: {
					name: "Code",
					slug: "code"
				},
				redirect: {
					from: "/fotoblog/hey",
					httpCode: 301
				}
			}
		]

		stub(TumblrImporter, "importTumblr")
			.withArgs(tumblrPosts).returns(
			tumblrDatumContainers
		)

		const dataContainer: DataContainer = {
			articleAttributesCollection: [],
			tagAttributesCollection: [],
			tagArticles: {},
			collectionAttributesCollection: [],
			collectionArticles: {},
			redirectAttributesCollection: [],
			redirectArticles: {}
		}

		const assetUploader = new AssetUploader(
			strapiUrl,
			strapiToken
		)

		const buildAssetUploader: AssetUploaderFactory = () => assetUploader

		const tumblrAssetMigrator =
			new TumblrAssetMigrator(
				tumblrDirectory,
				assetUploader
			)

		spy(tumblrAssetMigrator, "migrateAssets")

		const buildTumblrAssetMigrator: TumblrAssetMigratorFactory =
			() => tumblrAssetMigrator

		const squarespaceAssetMigrator = new SquarespaceAssetMigrator(
			squarespaceFilename,
			assetUploader
		)

		spy(squarespaceAssetMigrator, "migrateAssets")

		const buildSquarespaceAssetMigrator: SquarespaceAssetMigratorFactory = () => squarespaceAssetMigrator

		stub(DataContainerCollater, "collateDataContainer")
			.withArgs([...squarespaceDatumContainers, ...tumblrDatumContainers])
			.returns(dataContainer)

		const strapiExporter = new StrapiExporter(strapiUrl, strapiToken)
		const buildStrapiExporter: StrapiExporterFactory = () => strapiExporter

		stub(strapiExporter, "export").withArgs(dataContainer).resolves([])

		stub(validateArgv, "validateArgv").withArgs(global.process.argv).returns(
			{
				"_": [],
				"s": squarespaceFilename,
				"squarespace": squarespaceFilename,
				"t": tumblrDirectory,
				"tumblr": tumblrDirectory,
				"r": strapiUrl,
				"strapi": strapiUrl
			}
		)

		await main(
			buildStrapiExporter,
			buildTumblrAssetMigrator,
			buildSquarespaceAssetMigrator,
			buildAssetUploader
		)

		expect(importSquarespace).to.have.been.calledWith(squarespaceData)
		expect(strapiExporter.export).to.have.been.calledWith(dataContainer)
		expect(tumblrAssetMigrator.migrateAssets).to.have.been.calledWith(tumblrArticle)
		expect(squarespaceAssetMigrator.migrateAssets).to.have.been.calledWith(squarespaceArticle)
	})
})
