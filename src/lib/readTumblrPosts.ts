import {JSDOM} from "jsdom"
import {TumblrPost} from "types/TumblrPost"
import FsProxy from "fsProxy"
import * as path from "path"
import {Dirent} from "fs"

export const readTumblrPosts: ReadTumblrPosts = (fs, tumblrDirectory) => {
	return (
		fs.readdirSyncWithFileTypes(tumblrDirectory)
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
	(fs: FsProxy, tumblrDirectory: string) => TumblrPost[]
