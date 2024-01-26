import {JSDOM} from "jsdom"
import {Article} from "types/Article"
import {Tag} from "types/Tag"
import {DatumContainer} from "types/DatumContainer"
import {Redirect} from "types/Redirect"

export default class SquarespaceImporter {
	import = (squarespaceData: string): DatumContainer[] =>
		this
			._extractItems(squarespaceData)
			.filter(this._isPost)
			.filter(this._isPublished)
			.map(this._convertToDatumContainer)


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

	_convertToArticle = (item: Element): Article => {
		const pubDate = new Date(item.querySelector("pubDate")!.textContent!);

		return {
			title: item.querySelector("title")!.textContent!,
			body: new JSDOM(
				Array.from(item.querySelector("content\\:encoded")!.childNodes)[0].textContent!,
				{
					contentType: "text/html",
					url: "http://localhost"
				}
			).window.document.querySelector("article")!.textContent!,
			createdAt: pubDate,
			publishedAt: pubDate,
			updatedAt: pubDate,
			slug: item.querySelector("wp\\:post_name")!.textContent!,
			author: "elle mundy",
			og_type: "article"
		};
	}

	_extractCategories = (item: Element): Element[] =>
		Array.from(item.querySelectorAll('category[domain="post_tag"]'))

	_convertToTagAttributes = (category: Element): Tag => ({
		name: Array.from(category.childNodes)[0].textContent!,
		slug: Array.from(category.attributes).filter((attribute) =>
			attribute.name == "nicename"
		)[0].value
	})

	_extractRedirectAttributes = (item: Element): Redirect => ({
		from: item.querySelector("link")!.textContent!,
		httpCode: 301
	})

	_convertToDatumContainer = (item: Element): DatumContainer =>
		({
			articleAttributes: this._convertToArticle(item),

			tagAttributesCollection: this
				._extractCategories(item)
				.map(this._convertToTagAttributes)
				.filter((tagAttributes) =>
					tagAttributes.name != "Photography"
				),

			collectionAttributes: {
				name: "Photography",
				slug: "photography"
			},

			redirectAttributes: this._extractRedirectAttributes(item)
		})
}
