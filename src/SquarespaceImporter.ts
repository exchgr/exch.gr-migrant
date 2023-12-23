import {JSDOM} from "jsdom"
import {Post} from "types/Post"
import {Tag} from "types/Tag"
import {DataContainer} from "types/DataContainer"
import {PostTag} from "types/PostTag"
import {DatumContainer} from "types/DatumContainer"

export default class SquarespaceImporter {
	import = (squarespaceData: string): DataContainer =>
		this._convertToDataContainer(
			this
				._extractItems(squarespaceData)
				.filter(this._isPost)
				.filter(this._isPublished)
				.map(this._convertToDatumContainer)
		)

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

	_extractCategories = (item: Element): Element[] =>
		Array.from(item.querySelectorAll('category[domain="post_tag"]'))

	_convertToTag = (category: Element): Tag => ({
		name: Array.from(category.childNodes)[0].textContent!,
		slug: Array.from(category.attributes).filter((attribute) =>
			attribute.name == "nicename"
		)[0].value
	})

	_convertToDatumContainer = (item: Element): DatumContainer => {
		const post = this._convertToPost(item)
		const tags = this
			._extractCategories(item)
			.map(this._convertToTag)
			.filter((tag) =>
				tag.name != "Photography"
			)

		return ({
			post: post,
			tags: tags,
		})
	}

	_convertToDataContainer = (datumContainers: DatumContainer[]): DataContainer => {
		const seenTagSlugs: string[] = []

		return {
			posts: datumContainers.map((datumContainer) =>
				datumContainer.post
			),

			tags: datumContainers.flatMap((datumContainer) =>
				datumContainer.tags
			).filter((tag) =>
				seenTagSlugs.includes(tag.slug) ? false : seenTagSlugs.push(tag.slug)
			),

			postTags: datumContainers.flatMap((datumContainer) =>
				datumContainer.tags.map(this._connectPostTag(datumContainer.post))
			)
		}
	}

	_connectPostTag = (post: Post) =>
		(tag: Tag) =>
			({
				postSlug: post.slug,
				tagSlug: tag.slug
			})
}
