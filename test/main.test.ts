import * as chai from 'chai'
import {expect} from 'chai'
import {main} from "../src/main";
import {createStubInstance, stub} from "sinon";
import sinonChai from "sinon-chai";
import SquarespaceImporter from "../src/SquarespaceImporter";
import FsProxy from "../src/fsProxy";

chai.use(sinonChai)

describe("main", () => {
	it("should do nothing and exit successfully without arguments", () => {
		const argv: string[] = []
		const fsProxy = createStubInstance(FsProxy)

		const squarespaceImporter = new SquarespaceImporter()
		stub(squarespaceImporter, "import")

		main(argv, fsProxy, squarespaceImporter)

		expect(squarespaceImporter.import).not.to.have.been.called
	})

	it("should process an existing squarespace export xml", () => {
		const squarespaceFilename = 'resources/Squarespace-Wordpress-Export-10-12-2023.xml';
		const squarespaceData = "hi"

		const argv = ['-s', squarespaceFilename]

		const fsProxy = createStubInstance(FsProxy)
		fsProxy.readFileSync.withArgs(squarespaceFilename).returns(Buffer.from(squarespaceData))

		const squarespaceImporter = new SquarespaceImporter()
		stub(squarespaceImporter, "import")

		main(argv, fsProxy, squarespaceImporter)

		expect(squarespaceImporter.import).to.have.been.calledWith(squarespaceData)
	})

	it("should fail with a nonexistent file", () => {
		const squarespaceFilename = "hahaha nope.txt"
		const argv = ['-s', squarespaceFilename]

		const squarespaceImporter = new SquarespaceImporter()
		stub(squarespaceImporter, "import")

		const fsProxy = createStubInstance(FsProxy)
		const enoent = 'ENOENT';
		fsProxy.readFileSync.withArgs(squarespaceFilename).throws(enoent)

		expect(() => main(argv, fsProxy, squarespaceImporter)).to.throw(enoent)
		expect(squarespaceImporter.import).not.to.have.been.called
	})
})
