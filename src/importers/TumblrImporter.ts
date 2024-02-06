import {DatumContainer} from "types/DatumContainer"
import {TumblrPost} from "types/TumblrPost"
import {Article} from "types/Article"
import slug from 'slug'
import moment from "moment"
import {Tag} from "types/Tag"
import {Collection} from "types/Collection"
import {titleize} from "../lib/util"
import {Redirect} from "types/Redirect"

export type TumblrImporter = (posts: TumblrPost[]) => DatumContainer[]

const collectionSlugs: string[] = [
	"drawing",
	"music",
	"photography",
	"poetry",
	"code",
	"essays"
]

export const importTumblr: TumblrImporter = (posts: TumblrPost[]): DatumContainer[] =>
	[
		...(posts.filter(_isText).map(_textToDatumContainer)),
		...(posts.filter(_isPhoto).map(_photoToDatumContainer)),
	]

export const _isText = (post: TumblrPost): boolean =>
	!!post.dom.querySelector("h1")?.textContent

export const _textToDatumContainer = (post: TumblrPost): DatumContainer => ({
	article: _constructTextArticle(post.dom),
	tags: _constructTags(post.dom),
	collection: _constructCollection(post.dom),
	redirect: _constructTextRedirect(post)
})

export const _constructTextArticle = (dom: Document): Article => {
	const pubDate = moment(
		dom.querySelector("#footer #timestamp")!.textContent!,
		"MMMM Do, YYYY h:mma".trim()
	).toDate()

	// clone body so we don't remove elements that other methods need later
	const body = dom.createElement("body")
	body.innerHTML = dom.querySelector("body")!.innerHTML

	body.removeChild(body.querySelector("#footer")!)
	const title = body.removeChild(body.querySelector("h1")!).textContent!

	return {
		title,
		body: body.innerHTML.trim(), // excludes title and footer
		createdAt: pubDate,
		publishedAt: pubDate,
		updatedAt: pubDate,
		slug: slug(title),
		author: "elle mundy",
		og_type: "article"
	}
}

export const _constructTags = (dom: Document): Tag[] =>
	Array.from(dom.querySelectorAll("#footer .tag"))
		.map((tagElement: Element) => tagElement.textContent!)
		.filter((tagName: string) =>
			!collectionSlugs.includes(slug(tagName))
		)
		.map((tagName: string): Tag => ({
			name: tagName,
			slug: slug(tagName)
		}))

export const _constructCollection = (dom: Document): Collection =>
	Array.from(dom.querySelectorAll("#footer .tag"))
		.map((tagElement: Element) => tagElement.textContent!)
		.filter((tagName: string) =>
			collectionSlugs.includes(slug(tagName))
		)
		.map((tagName: string): Collection => ({
			name: titleize(tagName),
			slug: slug(tagName)
		}))[0] ||
	{
		name: "Essays",
		slug: "essays"
	}

export const _constructTextRedirect = (post: TumblrPost): Redirect => ({
	from: `/post/${post.id}/${slug(post.dom.querySelector("h1")!.textContent!)}`,
	httpCode: 301
})

export const _isPhoto = (post: TumblrPost): boolean =>
	!!post.dom.querySelector(".npf_row")

export const _photoToDatumContainer = (post: TumblrPost): DatumContainer => ({
	article: _constructPhotoArticle(post.dom),
	tags: _constructTags(post.dom),
	collection: _constructCollection(post.dom),
	redirect: _constructPhotoRedirect(post)
})

export const _constructPhotoRedirect = (post: TumblrPost): Redirect => ({
	from: `/post/${post.id}/${slug(post.dom.querySelector("p.npf_chat")!.textContent!)}`,
	httpCode: 301
})

export const _constructPhotoArticle = (dom: Document): Article => {
	const pubDate = moment(
		dom.querySelector("#footer #timestamp")!.textContent!,
		"MMMM Do, YYYY h:mma".trim()
	).toDate()

	const title = dom.querySelector("p.npf_chat")!.textContent!

	return ({
		title: title,
		body: dom.querySelector(".npf_row")!.innerHTML.trim(),
		createdAt: pubDate,
		publishedAt: pubDate,
		updatedAt: pubDate,
		slug: slug(title),
		author: "elle mundy",
		og_type: "article"
	})
}
