import { JSDOM } from "jsdom";
import { Post } from "Post";

export default class SquarespaceImporter {
	import = (squarespaceData: string): Post[] =>
		this._extractItems(squarespaceData).filter(this._isPost).filter(this._isPublished).map(this._convertToPost)

	_extractItems = (squarespaceData: string) =>
		Array.from(new JSDOM(
			squarespaceData,
			{
				contentType: "text/xml",
				url: "http://localhost"
			}
		).window.document.querySelectorAll("item"))

	_isPost = (item: Element) =>
		item.querySelector("wp\\:post_type")?.textContent == "post"

	_isPublished = (item: Element) =>
		item.querySelector("wp\\:status")?.textContent == "publish"

	_convertToPost = (item: Element): Post => {
		const pubDate = new Date(item.querySelector("pubDate")!.textContent!);

		return {
			title: item.querySelector("title")!.textContent!,
			body: Array.from(item.querySelector("content\\:encoded")!.childNodes)[0].textContent!,
			createdAt: pubDate,
			publishedAt: pubDate,
			updatedAt: pubDate,
			slug: item.querySelector("wp\\:post_name")!.textContent!,
			author: "elle mundy",
			collection: "Photography",
			og_type: "article"
		};
	}
}
