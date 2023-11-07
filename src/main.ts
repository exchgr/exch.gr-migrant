import SquarespaceImporter from "SquarespaceImporter";
import minimist from "minimist";
import FsProxy from "fsProxy";

const main = (
	argv: string[],
	fsProxy: FsProxy,
	squarespaceImporter: SquarespaceImporter
) => {
	const options = minimist(argv, {
		alias: {s: 'squarespace'}
	})

	if (options.squarespace) {
		squarespaceImporter.import(
			fsProxy.readFileSync(
				options.squarespace
			).toString()
		)
	}
}

export {
	main
}
