import {JSDOM} from "jsdom"
import {TumblrPost} from "types/TumblrPost"
import FsProxy from "fsProxy"

export const readTumblrPosts: ReadTumblrPosts = (fs: FsProxy, tumblrDirectory: string): TumblrPost[] => (
	fs.readdirSync(tumblrDirectory).map((filename) => ({
		id: filename.replace(/.html$/, ''),
		dom: new JSDOM(
			fs.readFileSync(filename).toString(),
			{
				contentType: "text/html",
				url: "http://localhost"
			}
		).window.document
	}))
)

export type ReadTumblrPosts =
	(fs: FsProxy, tumblrDirectory: string) => TumblrPost[]
