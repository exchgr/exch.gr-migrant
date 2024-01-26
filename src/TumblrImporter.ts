import {DatumContainer} from "types/DatumContainer"
import {TumblrPost} from "types/TumblrPost"
import {Article} from "types/Article"
import slug from 'slug'
import moment from "moment"
import {Tag} from "types/Tag"
import {Collection} from "types/Collection"
import {titleize} from "./lib/util"
import {Redirect} from "types/Redirect"

export default class TumblrImporter {
	static collectionSlugs: string[] = [
		"drawing",
		"music",
		"photography",
		"poetry",
		"code",
		"essays"
	]

	import = (posts: TumblrPost[]): DatumContainer[] =>
		[
			...(posts.filter(this._isPost).map(this._postToDatumContainer)),
			...(posts.filter(this._isImage).map(this._imageToDatumContainer)),
		]

	_isPost = (post: TumblrPost): boolean => (
		!!post.dom.querySelector("h1")?.textContent
	)

	_postToDatumContainer = (post: TumblrPost): DatumContainer => ({
		articleAttributes: this._convertPostDomToArticle(post.dom),
		tagAttributesCollection: this._extractTags(post.dom),
		collectionAttributes: this._extractCollection(post.dom),
		redirectAttributes: this._constructPostRedirect(post)
	})

	_convertPostDomToArticle = (dom: Document): Article => {
		const pubDate = moment(
			dom.querySelector("#footer #timestamp")!.textContent!,
			"MMMM Do, YYYY h:mma".trim()
		).toDate()

		// clone body so we don't remove elements that other methods need later
		const innerHTML = dom.querySelector("body")!.innerHTML
		const body = dom.createElement("div")
		body.innerHTML = innerHTML

		const titleH1 = body.querySelector("h1")!
		body.removeChild(titleH1)
		body.removeChild(body.querySelector("#footer")!)

		const title = titleH1.textContent!

		return {
			title,
			body: `${body.innerHTML.trim()}`,
			createdAt: pubDate,
			publishedAt: pubDate,
			updatedAt: pubDate,
			slug: slug(title),
			author: "elle mundy",
			og_type: "article"
		}
	}

	_extractTags = (dom: Document): Tag[] =>
		(
			Array.from(dom.querySelectorAll("#footer .tag"))
				.map((tagElement: Element) => tagElement.textContent!)
				.filter((tagName: string) =>
					!TumblrImporter.collectionSlugs.includes(slug(tagName))
				)
				.map((tagName: string): Tag => ({
					name: tagName,
					slug: slug(tagName)
				}))
		)

	_extractCollection = (dom: Document): Collection =>
		(
			Array.from(dom.querySelectorAll("#footer .tag"))
				.map((tagElement: Element) => tagElement.textContent!)
				.filter((tagName: string) =>
					TumblrImporter.collectionSlugs.includes(slug(tagName))
				)
				.map((tagName: string): Collection => ({
					name: titleize(tagName),
					slug: slug(tagName)
				}))[0] ||
			{
				name: "Essays",
				slug: "essays"
			}
		)

	_constructPostRedirect = (post: TumblrPost): Redirect => ({
		from: `/post/${post.id}/${slug(post.dom.querySelector("h1")!.textContent!)}`,
		httpCode: 301
	})

	_isImage = (post: TumblrPost): boolean => (
	  !!post.dom.querySelector(".npf_row")
	)

	_imageToDatumContainer = (post: TumblrPost): DatumContainer => ({
		articleAttributes: this._convertImageDomToArticle(post.dom),
		tagAttributesCollection: this._extractTags(post.dom),
		collectionAttributes: this._extractCollection(post.dom),
		redirectAttributes: this._constructImageRedirect(post)
	})

	_constructImageRedirect = (post: TumblrPost): Redirect => ({
		from: `/post/${post.id}/${slug(post.dom.querySelector("p.npf_chat")!.textContent!)}`,
		httpCode: 301
	})

	_convertImageDomToArticle = (dom: Document): Article => {
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
}
