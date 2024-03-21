import FsProxy from "fsProxy"
import minimist from "minimist"

export const validateArgv = (argv: string[], fsProxy: FsProxy): minimist.ParsedArgs => {
	const options = minimist(argv, {
		alias: {
			s: 'squarespace',
			t: 'tumblr',
			r: 'strapi',
			c: 'cacheDirectory'
		}
	})

	if (!options.strapi)
		throw new Error('Strapi server unspecified.')

	if (!fsProxy.existsSync(options.squarespace))
		throw new Error(`Squarespace archive ${options.squarespace} doesn't exist.`)

	if (!fsProxy.existsSync(options.tumblr))
		throw new Error(`Tumblr archive ${options.tumblr} doesn't exist.`)

	if (fsProxy.readdirSync(options.cacheDirectory).length > 0)
		throw new Error(`Cache directory ${options.cacheDirectory} isn't empty.`)

	return options
}
export type ValidateArgv = (argv: string[], fsProxy: FsProxy) => minimist.ParsedArgs
