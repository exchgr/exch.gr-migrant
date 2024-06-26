import {JSDOM} from "jsdom"
import {TumblrPost} from "types/TumblrPost"
import * as path from "path"
import fs, {Dirent} from "fs"

export const readTumblrPosts: ReadTumblrPosts = (tumblrDirectory) => {
	return (
		fs.readdirSync(tumblrDirectory, { withFileTypes: true })
			.filter(_onlyFiles)
			.map((dirent) => ({
				id: dirent.name.replace(/.html$/, ''),
				dom: new JSDOM(
					fs.readFileSync(path.join(tumblrDirectory, dirent.name)).toString(),
					{
						contentType: "text/html",
						url: "http://localhost"
					}
				).window.document
			}))
	)
}

export const _onlyFiles = (dirent: Dirent) => dirent.isFile()

export type ReadTumblrPosts =
	(tumblrDirectory: string) => TumblrPost[]
