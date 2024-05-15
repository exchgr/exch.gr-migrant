import {DatumContainer} from "types/DatumContainer"
import {TumblrPost} from "types/TumblrPost"
import {Article} from "types/Article"
import slug from 'slug'
import moment from "moment"
import {Tag} from "types/Tag"
import {Collection} from "types/Collection"
import {titleize} from "../lib/util"
import {Redirect} from "types/Redirect"

const collectionSlugs: string[] = [
	"drawing",
	"music",
	"photography",
	"poetry",
	"code",
	"essays"
]

export const importTumblr: (posts: TumblrPost[]) => DatumContainer[] = (posts: TumblrPost[]): DatumContainer[] =>
	[
		...(posts.filter(_isText).map(_textToDatumContainer)),
		...(posts.filter(_isPhoto).map(_photoToDatumContainer)),
	]

export const _isText = (post: TumblrPost): boolean =>
	!!post.dom.querySelector("h1")?.textContent

export const _textToDatumContainer = (post: TumblrPost): DatumContainer => ({
	article: _constructTextArticle(post),
	tags: _constructTags(post.dom),
	collection: _constructCollection(post.dom),
	redirect: _constructTextRedirect(post)
})

export const _sanitizeBody = (id: string, body: Element) => {
	Array.from(body.querySelectorAll("img")).forEach(
		(img, index) => {
			img.src = `../media/${id}_${index}${img.src.match(/\.[^.]+$/)![0]}`
			img.removeAttribute("srcset")
			img.removeAttribute("sizes")
		})

	return body.innerHTML.trim()
}

export const _constructTextArticle = (post: TumblrPost): Article => {
	const pubDate = moment(
		post.dom.querySelector("#footer #timestamp")!.textContent!,
		"MMMM Do, YYYY h:mma".trim()
	).toDate()

	// clone body so we don't remove elements that other methods need later
	const body = post.dom.createElement("body")
	body.innerHTML = post.dom.querySelector("body")!.innerHTML

	body.removeChild(body.querySelector("#footer")!)
	const title = body.removeChild(body.querySelector("h1")!).textContent!

	return {
		title,
		body: _sanitizeBody(post.id, body), // excludes title and footer
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
	article: _constructPhotoArticle(post),
	tags: _constructTags(post.dom),
	collection: _constructCollection(post.dom),
	redirect: _constructPhotoRedirect(post)
})

export const _constructPhotoRedirect = (post: TumblrPost): Redirect => ({
	from: `/post/${post.id}/${slug(post.dom.querySelector("p.npf_chat")!.textContent!)}`,
	httpCode: 301
})

export const _constructPhotoArticle = (post: TumblrPost): Article => {
	const pubDate = moment(
		post.dom.querySelector("#footer #timestamp")!.textContent!,
		"MMMM Do, YYYY h:mma".trim()
	).toDate()

	const title = post.dom.querySelector("p.npf_chat")!.textContent!

	return ({
		title: title,
		body: _sanitizeBody(post.id, post.dom.querySelector(".npf_row")!),
		createdAt: pubDate,
		publishedAt: pubDate,
		updatedAt: pubDate,
		slug: slug(title),
		author: "elle mundy",
		og_type: "article"
	})
}
