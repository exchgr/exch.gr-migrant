import minimist from "minimist"
import * as process from "process"
import fs from "fs"

export const validateArgv: ValidateArgv = (argv) => {
	const options = minimist(argv, {
		alias: {
			s: 'squarespace',
			t: 'tumblr',
			r: 'strapi',
			c: 'cacheDirectory',
			h: 'help'
		}
	})

	if (options.help) {
		console.error(
`Migrant: the blog migrator

Usage:
yarn run migrate [options]

Options:
-h
	Print this help message
	
Importers:
NOTE: At least one importer is required.

-s, --squarespace [filename]
	Specify the squarespace export XML file
	
-t, --tumblr [directory]
	Specify the tumblr export directory where html files live, including 
	the /posts/html subdirectory.
	
-r, --strapi [url]
	Specify the URL of your strapi server, including protocol, hostname, and 
	(optionally) port.
	
-c, --cacheDirectory [directory]
	Specify the directory where assets will be cached when migrating from Tumblr.
`
		)
		process.exit()
	}

	if (!options.strapi)
		throw new Error('Strapi server unspecified.')

	if (!options.squarespace && !options.tumblr) {
		throw new Error(
`No importers specified. Please check your command line arguments.
For more information, see the README or run this command with -h.`
		)
	}

	if (options.squarespace && !fs.existsSync(options.squarespace))
		throw new Error(`Squarespace archive ${options.squarespace} doesn't exist.`)

	if (options.tumblr && !fs.existsSync(options.tumblr))
		throw new Error(`Tumblr archive ${options.tumblr} doesn't exist.`)

	if (fs.readdirSync(options.cacheDirectory).length > 0)
		throw new Error(`Cache directory ${options.cacheDirectory} isn't empty.`)

	return options
}

export type ValidateArgv = (argv: string[]) => minimist.ParsedArgs
