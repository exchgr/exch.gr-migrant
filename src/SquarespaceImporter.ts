import {JSDOM} from "jsdom"
import {Article} from "types/Article"
import {Tag} from "types/Tag"
import {DataContainer} from "types/DataContainer"
import {DatumContainer} from "types/DatumContainer"
import {Collection} from "types/Collection"
import {Connection} from "types/Connection"
import {Redirect} from "types/Redirect"

export default class SquarespaceImporter {
	import = (squarespaceData: string): DataContainer =>
		this._collateToDataContainer(
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

	_convertToArticleAttributes = (item: Element): Article => {
		const pubDate = new Date(item.querySelector("pubDate")!.textContent!);

		return {
			title: item.querySelector("title")!.textContent!,
			body: Array.from(item.querySelector("content\\:encoded")!.childNodes)[0].textContent!,
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
			articleAttributes: this._convertToArticleAttributes(item),

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

	_collateToDataContainer = (datumContainers: DatumContainer[]): DataContainer => {
		const seenTagSlugs: string[] = []
		const seenCollectionSlugs: string[] = []

		return {
			articleAttributesCollection: datumContainers.map((datumContainer) =>
				datumContainer.articleAttributes
			),

			tagAttributesCollection: datumContainers.flatMap((datumContainer) =>
				datumContainer.tagAttributesCollection
			).filter((tagAttributes) =>
				seenTagSlugs.includes(tagAttributes.slug) ? false : seenTagSlugs.push(tagAttributes.slug)
			),

			collectionAttributesCollection: datumContainers.map((datumContainer) =>
				datumContainer.collectionAttributes
			).filter((collectionAttributes: Collection) =>
				seenCollectionSlugs.includes(collectionAttributes.slug) ? false : seenCollectionSlugs.push(collectionAttributes.slug)
			),

			tagArticles: datumContainers.reduce((tagArticles, datumContainer): Connection => {
				datumContainer.tagAttributesCollection.forEach((tagAttributes) => {
					tagArticles[tagAttributes.slug] ||= []
					tagArticles[tagAttributes.slug].push(datumContainer.articleAttributes.slug)
				})

				return tagArticles
			}, {} as Connection),

			collectionArticles: datumContainers.reduce((collectionArticles, datumContainer): Connection => {
				collectionArticles[datumContainer.collectionAttributes.slug] ||= []
				collectionArticles[datumContainer.collectionAttributes.slug].push(datumContainer.articleAttributes.slug)

				return collectionArticles
			}, {} as Connection),

			redirectAttributesCollection: datumContainers.map((datumContainer: DatumContainer) => (
				datumContainer.redirectAttributes
			))
		}
	}
}
