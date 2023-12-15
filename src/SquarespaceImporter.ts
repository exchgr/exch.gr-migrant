import { JSDOM } from "jsdom";
import { Post } from "Post";
import {Tag} from "Tag"
import {DataContainer} from "DataContainer"
import {PostTag} from "PostTag"
import {DatumContainer} from "DatumContainer"

export default class SquarespaceImporter {
	import = (squarespaceData: string): DataContainer => {
		const datumContainers = this._extractItems(squarespaceData).filter(this._isPost).filter(this._isPublished).map(this._convertToDatumContainer)

		return {
			posts: datumContainers.map((datumContainer) =>
				datumContainer.post
			),

			// TODO NEXT: dedupe tags and postTags
			tags: datumContainers.flatMap((datumContainer) =>
				datumContainer.tags
			),

			postTags: datumContainers.flatMap((datumContainer) =>
				datumContainer.postTags
			)
		}
	}

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

	_connectPostTag = (post: Post, tag: Tag): PostTag => ({
		postSlug: post.slug,
		tagSlug: tag.slug
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
			postTags: tags.map((tag): PostTag =>
				this._connectPostTag(post, tag))
		})
	}
}
