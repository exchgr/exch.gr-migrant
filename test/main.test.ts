import {JSDOM} from "jsdom"
import chai, {expect} from 'chai'
import {main} from "../src/main"
import {spy, stub} from "sinon"
import sinonChai from "sinon-chai"
import chaiAsPromised from "chai-as-promised"
import FsProxy from "../src/fsProxy"
import Strapi, {StrapiOptions} from "strapi-sdk-js"
import {StrapiExporter} from "../src/exporters/StrapiExporter"
import {DataContainer} from "../src/types/DataContainer"
import {ValidateArgv} from "../src/lib/validateArgv"
import {DatumContainer} from "../src/types/DatumContainer"
import {DataContainerCollater} from "../src/DataContainerCollater"
import {TumblrPost} from "../src/types/TumblrPost"
import {SquarespaceImporter} from "../src/importers/SquarespaceImporter"
import {TumblrImporter} from "../src/importers/TumblrImporter"
import {StrapiFactory} from "../src/factories/StrapiFactory"
import {StrapiExporterFactory} from "../src/factories/StrapiExporterFactory"
import axios, {AxiosInstance} from "axios"
import {AxiosFactory} from "../src/factories/AxiosFactory"
import {TumblrAssetMigratorFactory} from "../src/factories/TumblrAssetMigratorFactory"
import {TumblrAssetMigrator} from "../src/assetMigrators/TumblrAssetMigrator"
import {
	SquarespaceAssetMigrator
} from "../src/assetMigrators/SquarespaceAssetMigrator"
import {AssetUploader} from "../src/assetMigrators/AssetUploader"
import {AssetUploaderFactory} from "../src/factories/AssetUploaderFactory"
import {
	SquarespaceAssetMigratorFactory
} from "../src/factories/SquarespaceAssetMigratorFactory"

chai.use(sinonChai)
chai.use(chaiAsPromised)

const strapiUrl = "http://localhost:1337"

describe("main", () => {
	it("should process an existing squarespace export xml and export to strapi", async () => {
		const squarespaceFilename = 'resources/Squarespace-Wordpress-Export-10-12-2023.xml';
		const squarespaceData = "hi"
		const tumblrDirectory = "here"
		const fsProxy = new FsProxy()
		stub(fsProxy, "readFileSync").withArgs(squarespaceFilename).returns(Buffer.from(squarespaceData))

		const argv: string[] = [
			'-s', squarespaceFilename,
			'-t', tumblrDirectory,
			'-r', strapiUrl
		]

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

		const importSquarespace: SquarespaceImporter = spy((_data: string) =>
			squarespaceDatumContainers
		)

		const tumblrPostFilenames = [
			"1.html",
			"2.html"
		]

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

		const readTumblrPosts = (_1: FsProxy, _2: string): TumblrPost[] => (tumblrPosts)

		stub(fsProxy, "readdirSync").withArgs(tumblrDirectory).returns(tumblrPostFilenames)

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

		const importTumblr: TumblrImporter = spy((_tumblrPosts: TumblrPost[]) =>
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

		const buildAxios: AxiosFactory = (_: string) => axios.create()

		const assetUploader = new AssetUploader(axios, fsProxy)

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
			axios,
			fsProxy,
			squarespaceFilename,
			assetUploader
		)

		spy(squarespaceAssetMigrator, "migrateAssets")

		const buildSquarespaceAssetMigrator: SquarespaceAssetMigratorFactory = () => squarespaceAssetMigrator

		const collateDataContainer: DataContainerCollater =
			spy(
				(_datumContainers: DatumContainer[]): DataContainer => dataContainer
			)

		const strapi = new Strapi({ url: strapiUrl })
		const buildStrapi: StrapiFactory = (_strapiOptions: StrapiOptions) => strapi

		const strapiExporter = new StrapiExporter(strapi)
		const buildStrapiExporter: StrapiExporterFactory = (_: Strapi) => strapiExporter

		stub(strapiExporter, "export").withArgs(dataContainer).resolves([])

		const fakeValidate: ValidateArgv = (_1: string[], _2: FsProxy) => (
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
			argv,
			fakeValidate,
			fsProxy,
			importSquarespace,
			readTumblrPosts,
			importTumblr,
			collateDataContainer,
			buildStrapi,
			buildStrapiExporter,
			buildAxios,
			buildTumblrAssetMigrator,
			buildSquarespaceAssetMigrator,
			buildAssetUploader
		)

		expect(importSquarespace).to.have.been.calledWith(squarespaceData)
		expect(importTumblr).to.have.been.calledWith(tumblrPosts)
		expect(strapiExporter.export).to.have.been.calledWith(dataContainer)
		expect(collateDataContainer).to.have.been.calledWith([
			...squarespaceDatumContainers,
			...tumblrDatumContainers,
		])
		expect(tumblrAssetMigrator.migrateAssets).to.have.been.calledWith(tumblrArticle)
		expect(squarespaceAssetMigrator.migrateAssets).to.have.been.calledWith(squarespaceArticle)
	})
})
