import chai, {expect} from 'chai'
import {main} from "../src/main"
import {createStubInstance, stub} from "sinon"
import sinonChai from "sinon-chai"
import chaiAsPromised from "chai-as-promised"
import SquarespaceImporter from "../src/SquarespaceImporter"
import FsProxy from "../src/fsProxy"
import Strapi, {StrapiOptions} from "strapi-sdk-js"
import {StrapiExporter} from "../src/StrapiExporter"
import {DataContainer} from "../src/DataContainer"

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe("main", () => {
	const strapiUrl = "http://localhost:1337"

	it("should fail with a nonexistent file", async () => {
		const squarespaceFilename = "hahaha nope.txt"
		const argv = ['-s', squarespaceFilename, '-t', strapiUrl]

		const squarespaceImporter = new SquarespaceImporter()
		stub(squarespaceImporter, "import")

		const fsProxy = createStubInstance(FsProxy)
		const enoent = 'ENOENT';
		fsProxy.readFileSync.withArgs(squarespaceFilename).throws(enoent)

		const strapi = new Strapi({ url: strapiUrl })

		const buildStrapi = (_strapiOptions: StrapiOptions) => strapi

		const strapiExporter = new StrapiExporter(strapi)
		const buildStrapiExporter = (strapi: Strapi) => strapiExporter

		expect(main(argv, fsProxy, squarespaceImporter, buildStrapi, buildStrapiExporter)).to.be.rejectedWith(enoent)
		expect(squarespaceImporter.import).not.to.have.been.called
	})

	it("should fail if strapi server is unspecified", () => {
		const argv: string[] = []

		const squarespaceFilename = 'resources/Squarespace-Wordpress-Export-10-12-2023.xml';
		const squarespaceData = "hi"
		const fsProxy = createStubInstance(FsProxy)
		fsProxy.readFileSync.withArgs(squarespaceFilename).returns(Buffer.from(squarespaceData))

		const squarespaceImporter = new SquarespaceImporter()
		stub(squarespaceImporter, "import")

		const strapi = new Strapi({ url: strapiUrl })

		const buildStrapi = (_strapiOptions: StrapiOptions) => strapi

		const strapiExporter = new StrapiExporter(strapi)
		const buildStrapiExporter = (strapi: Strapi) => strapiExporter

		expect(main(argv, fsProxy, squarespaceImporter, buildStrapi, buildStrapiExporter)).to.be.rejectedWith('Strapi server unspecified.')
	})

	it("should process an existing squarespace export xml and export to strapi", async () => {
		const squarespaceFilename = 'resources/Squarespace-Wordpress-Export-10-12-2023.xml';
		const squarespaceData = "hi"
		const fsProxy = createStubInstance(FsProxy)
		fsProxy.readFileSync.withArgs(squarespaceFilename).returns(Buffer.from(squarespaceData))

		const argv: string[] = ['-s', squarespaceFilename, '-t', strapiUrl]

		const posts = [
			{
				title: "hi",
				body: "<article>hi</article>",
				slug: "hi",
				author: "me",
				collection: "poasts",
				og_type: "poast",
				createdAt: new Date(),
				updatedAt: new Date(),
				publishedAt: new Date()
			},
			{
				title: "hey",
				body: "<article>hey</article>",
				slug: "hey",
				author: "me",
				collection: "poasts",
				og_type: "poast",
				createdAt: new Date(),
				updatedAt: new Date(),
				publishedAt: new Date()
			}
		]

		const dataContainer: DataContainer = {
			posts: posts,
			tags: [],
			postTags: []
		}

		const squarespaceImporter = new SquarespaceImporter()
		stub(squarespaceImporter, "import").withArgs(squarespaceData).returns(dataContainer)

		const strapi = new Strapi({ url: strapiUrl })
		const buildStrapi = (_strapiOptions: StrapiOptions) => strapi

		const strapiExporter = new StrapiExporter(strapi)
		const buildStrapiExporter = (strapi: Strapi) => strapiExporter

		stub(strapiExporter, "export").withArgs(posts).resolves([{
			data: {},
			meta: {}
		}])

		await main(argv, fsProxy, squarespaceImporter, buildStrapi, buildStrapiExporter)

		expect(squarespaceImporter.import).to.have.been.calledWith(squarespaceData)
		expect(strapiExporter.export).to.have.been.calledWith(posts)
		}
	)
})
