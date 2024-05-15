import {JSDOM} from "jsdom"
import {Article} from "types/Article"
import {Tag} from "types/Tag"
import {DatumContainer} from "types/DatumContainer"
import {Redirect} from "types/Redirect"

export const importSquarespace: (data: string) => DatumContainer[] =
	(squarespaceData: string): DatumContainer[] =>
		_extractItems(squarespaceData)
			.filter(_isPost)
			.filter(_isPublished)
			.map(_convertToDatumContainer)

export const _extractItems = (squarespaceData: string) =>
	Array.from(new JSDOM(
		squarespaceData,
		{
			contentType: "text/xml",
			url: "http://localhost"
		}
	).window.document.querySelectorAll("item"))

export const _isPost = (item: Element) =>
	item.querySelector("wp\\:post_type")?.textContent == "post"

export const _isPublished = (item: Element) =>
	item.querySelector("wp\\:status")?.textContent == "publish"

export const _constructArticle = (item: Element): Article => {
	const pubDate = new Date(item.querySelector("pubDate")!.textContent!);

	return {
		title: item.querySelector("title")!.textContent!,
		body: new JSDOM(
			Array.from(item.querySelector("content\\:encoded")!.childNodes)[0].textContent!,
			{
				contentType: "text/html",
				url: "http://localhost"
			}
		).window.document.body.innerHTML,
		createdAt: pubDate,
		publishedAt: pubDate,
		updatedAt: pubDate,
		slug: item.querySelector("wp\\:post_name")!.textContent!,
		author: "elle mundy",
		og_type: "article"
	};
}

export const _extractCategories = (item: Element): Element[] =>
	Array.from(item.querySelectorAll('category[domain="post_tag"]'))

export const _constructTag = (category: Element): Tag => ({
	name: Array.from(category.childNodes)[0].textContent!,
	slug: Array.from(category.attributes).filter((attribute) =>
		attribute.name == "nicename"
	)[0].value
})

export const _constructRedirect = (item: Element): Redirect => ({
	from: item.querySelector("link")!.textContent!,
	httpCode: 301
})

export const _convertToDatumContainer = (item: Element): DatumContainer => ({
	article: _constructArticle(item),

	tags: _extractCategories(item)
		.map(_constructTag)
		.filter((tag) =>
			tag.name != "Photography"
		),

	collection: {
		name: "Photography",
		slug: "photography"
	},

	redirect: _constructRedirect(item)
})
