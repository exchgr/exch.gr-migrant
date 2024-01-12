import {Article} from "types/Article"
import {ArticleAttributes} from "types/ArticleAttributes"
import Strapi from "strapi-sdk-js"
import {partition, promiseSequence} from "./lib/util"
import {TagAttributes} from "types/TagAttributes"
import {Tag} from "types/Tag"
import {DataContainer} from "types/DataContainer"
import {CollectionAttributes} from "types/CollectionAttributes"
import {Collection} from "types/Collection"
import {CollectionArticles} from "types/CollectionArticles"
import {TagArticles} from "types/TagArticles"
import {RedirectAttributes} from "types/RedirectAttributes"
import {Redirect} from "types/Redirect"
import {Entity} from "types/Entity"

export class StrapiExporter {
	private strapi: Strapi

	constructor(strapi: Strapi) {
		this.strapi = strapi
	}

	export = async (dataContainer: DataContainer): Promise<(Entity)[]> => {
		const [extantArticles, newArticles]: Article[][] = partition(
			await Promise.all(dataContainer.articleAttributesCollection.map(this._findOrInitArticle)),
			this._exists
		)

		const ensuredArticles = await promiseSequence([
			...newArticles.map(this._createArticle),
			...extantArticles.map(this._updateArticle),
		])


		const [extantTags, newTags]: Tag[][] = partition(
			this._connectArticlesToTags(
				dataContainer.tagArticles,
				ensuredArticles,
				await Promise.all(
					dataContainer.tagAttributesCollection.map(this._findOrInitTag)
				)
			),
			this._exists
		)

		const [extantCollections, newCollections]: Collection[][] = partition(
			this._connectArticlesToCollections(
				dataContainer.collectionArticles,
				ensuredArticles,
				await Promise.all(
					dataContainer.collectionAttributesCollection.map(
						this._findOrInitCollection
					)
				)
			),
			this._exists
		)

		const [extantRedirects, newRedirects]: Redirect[][] = partition(
			await Promise.all(
				dataContainer.redirectAttributesCollection.map(this._findOrInitRedirect)
			),
			this._exists
		)

		return [
			...ensuredArticles,
			...await promiseSequence<Entity>([
				...newTags.map(this._createTag),
				...extantTags.map(this._updateTag),
				...newCollections.map(this._createCollection),
				...extantCollections.map(this._updateCollection),
				...newRedirects.map(this._createRedirect),
				...extantRedirects.map(this._updateRedirect)
			])
		]
	}

	_findOrInitArticle = async (articleAttributes: ArticleAttributes): Promise<Article> => {
		try {
			const article: Article = (await this.strapi.find<Article[]>('articles', {
				filters: {
					slug: {
						$eq: articleAttributes.slug
					}
				}
			})).data[0]

			article.attributes = articleAttributes

			return article
		} catch (e: any) {
			if (e.error.name !== "NotFoundError") {
				throw e
			}

			return {
				id: undefined,
				attributes: articleAttributes,
				meta: {}
			} as Article
		}
	}

	_createArticle = async (article: Article): Promise<Article> =>
		(await this.strapi.create<Article>('articles', article.attributes)).data

	_updateArticle = async (article: Article): Promise<Article> =>
		(await this.strapi.update<Article>('articles', article.id!, article.attributes)).data

	_exists = (entity: Entity) => !!entity.id

	// it's complex because we're complecting. deal with it.
	_connectArticlesToTags = (tagArticles: TagArticles, articles: Article[], tags: Tag[]): Tag[] =>
		tags.map((tag): Tag => ({
			...tag,
			attributes: {
				...tag.attributes,
				articles: articles.filter((article) =>
					tagArticles[tag.attributes.slug].includes(article.attributes.slug)
				).map((article): number => article.id!)
			}
		}))

	_findOrInitTag = async (tagAttributes: TagAttributes): Promise<Tag> => {
		try {
			const tag: Tag = (await this.strapi.find<Tag[]>('tags', {
				filters: {
					slug: {
						$eq: tagAttributes.slug
					}
				}
			})).data[0]

			tag.attributes = tagAttributes

			return tag
		} catch (e: any) {
			if (e.error.name !== "NotFoundError") {
				throw e
			}

			return {
				id: undefined,
				attributes: tagAttributes,
				meta: {}
			} as Tag
		}
	}

	_createTag = async (tag: Tag): Promise<Tag> =>
		(await this.strapi.create<Tag>('tags', tag.attributes)).data

	_updateTag = async (tag: Tag): Promise<Tag> =>
		(await this.strapi.update<Tag>('tags', tag.id!, tag.attributes)).data

	_findOrInitCollection = async (collectionAttributes: CollectionAttributes): Promise<Collection> => {
		try {
			const collection: Collection = (await this.strapi.find<Collection[]>('collections', {
				filters: {
					slug: {
						$eq: collectionAttributes.slug
					}
				}
			})).data[0]

			collection.attributes = collectionAttributes

			return collection
		} catch (e: any) {
			if (e.error.name !== "NotFoundError") {
				throw e
			}

			return {
				attributes: collectionAttributes,
				meta: {}
			} as Collection
		}
	}

	_createCollection = async (collection: Collection): Promise<Collection> =>
		(await this.strapi.create<Collection>('collections', collection.attributes)).data

	_updateCollection = async (collection: Collection): Promise<Collection> =>
		(await this.strapi.update<Collection>('collections', collection.id!, collection.attributes)).data

	_connectArticlesToCollections = (
		collectionArticles: CollectionArticles,
		articles: Article[],
		collections: Collection[]
	): Collection[] =>
		collections.map((collection: Collection) => ({
			...collection,
			attributes: {
				...collection.attributes,
				articles: articles.filter((article: Article) =>
					collectionArticles[collection.attributes.slug].includes(article.attributes.slug )
				).map((article: Article) => article.id!)
			}
		}))

	_findOrInitRedirect = async (redirectAttributes: RedirectAttributes): Promise<Redirect> => {
		try {
			const redirect: Redirect = (await this.strapi.find<Redirect[]>('redirects', {
				filters: {
					from: {
						$eq: redirectAttributes.from
					}
				}
			})).data[0]

			redirect.attributes = redirectAttributes

			return redirect
		} catch (e: any) {
			if (e.error.name !== "NotFoundError") {
				throw e
			}

			return {
				attributes: redirectAttributes,
				meta: {}
			} as Redirect
		}
	}

	_createRedirect = async (redirect: Redirect): Promise<Redirect> =>
		(await this.strapi.create<Redirect>('redirects', redirect.attributes)).data

	_updateRedirect = async (redirect: Redirect): Promise<Redirect> =>
		(await this.strapi.update<Redirect>('redirects', redirect.id!, redirect.attributes)).data
}
