import {JSDOM} from "jsdom"
import chai, {expect} from 'chai'
import {main} from "../src/main"
import {stub} from "sinon"
import sinonChai from "sinon-chai"
import chaiAsPromised from "chai-as-promised"
import SquarespaceImporter from "../src/SquarespaceImporter"
import FsProxy from "../src/fsProxy"
import Strapi, {StrapiOptions} from "strapi-sdk-js"
import {StrapiExporter} from "../src/StrapiExporter"
import {DataContainer} from "../src/types/DataContainer"
import TumblrImporter from "../src/TumblrImporter"
import {ValidateArgv} from "../src/lib/validateArgv"
import {DatumContainer} from "../src/types/DatumContainer"
import {DataContainerCollater} from "../src/DataContainerCollater"
import {TumblrPost} from "../src/types/TumblrPost"

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

		const squarespaceDatumContainers: DatumContainer[] = [
			{
				articleAttributes: {
					title: "hi",
					body: "hi",
					createdAt: pubDate,
					publishedAt: pubDate,
					updatedAt: pubDate,
					slug: "hi",
					author: "elle mundy",
					og_type: "article",
				},
				tagAttributesCollection: [
					{
						name: "hi",
						slug: "hi"
					}
				],
				collectionAttributes: {
					name: "Photography",
					slug: "photography"
				},
				redirectAttributes: {
					from: "/fotoblog/hi",
					httpCode: 301
				}
			}
		]

		const squarespaceImporter = new SquarespaceImporter()
		stub(squarespaceImporter, "import").withArgs(squarespaceData).returns(squarespaceDatumContainers)

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

		const tumblrDatumContainers: DatumContainer[] = [
			{
				articleAttributes: {
					title: "hey",
					body: "hey",
					createdAt: pubDate,
					publishedAt: pubDate,
					updatedAt: pubDate,
					slug: "hey",
					author: "elle mundy",
					og_type: "article",
				},
				tagAttributesCollection: [
					{
						name: "hi",
						slug: "hi"
					},
					{
						name: "hey",
						slug: "hey"
					}
				],
				collectionAttributes: {
					name: "Code",
					slug: "code"
				},
				redirectAttributes: {
					from: "/fotoblog/hey",
					httpCode: 301
				}
			}
		]

		const tumblrImporter = new TumblrImporter()
		stub(tumblrImporter, "import").withArgs(tumblrPosts).returns(tumblrDatumContainers)

		const dataContainer: DataContainer = {
			articleAttributesCollection: [],
			tagAttributesCollection: [],
			tagArticles: {},
			collectionAttributesCollection: [],
			collectionArticles: {},
			redirectAttributesCollection: [],
			redirectArticles: {}
		}

		const dataContainerCollater = new DataContainerCollater()
		stub(dataContainerCollater, "collate").withArgs([
			...squarespaceDatumContainers,
			...tumblrDatumContainers,
		]).returns(dataContainer)

		const strapi = new Strapi({ url: strapiUrl })
		const buildStrapi = (_strapiOptions: StrapiOptions) => strapi

		const strapiExporter = new StrapiExporter(strapi)
		const buildStrapiExporter = (_: Strapi) => strapiExporter

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

		await main(argv, fakeValidate, fsProxy, squarespaceImporter, readTumblrPosts, tumblrImporter, dataContainerCollater, buildStrapi, buildStrapiExporter)

		expect(squarespaceImporter.import).to.have.been.calledWith(squarespaceData)
		expect(tumblrImporter.import).to.have.been.calledWith(tumblrPosts)
		expect(strapiExporter.export).to.have.been.calledWith(dataContainer)
		}
	)
})
