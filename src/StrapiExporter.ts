import {Article} from "types/Article"
import Strapi from "strapi-sdk-js"
import {partition, promiseSequence} from "./lib/util"
import {Tag} from "types/Tag"
import {DataContainer} from "types/DataContainer"
import {Collection} from "types/Collection"
import {CollectionArticles} from "types/CollectionArticles"
import {TagArticles} from "types/TagArticles"
import {Redirect} from "types/Redirect"
import {Entity} from "types/Entity"
import {Table} from "types/Table"

export class StrapiExporter {
	private strapi: Strapi

	constructor(strapi: Strapi) {
		this.strapi = strapi
	}

	export = async (dataContainer: DataContainer): Promise<(Entity)[]> => {
		const [extantArticles, newArticles]: Article[][] = partition(
			await Promise.all(dataContainer.articleAttributesCollection.map(this._findOrInitEntityByProperty<Article>('articles', 'slug'))),
			this._exists
		)

		const ensuredArticles = await promiseSequence([
			...newArticles.map(this._createEntity('articles')),
			...extantArticles.map(this._updateArticle),
		])


		const [extantTags, newTags]: Tag[][] = partition(
			this._connectArticlesToTags(
				dataContainer.tagArticles,
				ensuredArticles,
				await Promise.all(
					dataContainer.tagAttributesCollection.map(
						this._findOrInitEntityByProperty<Tag>('tags', 'slug')
					)
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
						this._findOrInitEntityByProperty<Collection>('collections', 'slug')
					)
				)
			),
			this._exists
		)

		const [extantRedirects, newRedirects]: Redirect[][] = partition(
			await Promise.all(
				dataContainer.redirectAttributesCollection.map(this._findOrInitEntityByProperty<Redirect>('redirects', 'from'))
			),
			this._exists
		)

		return [
			...ensuredArticles,
			...await promiseSequence<Entity>([
				...newTags.map(this._createEntity('tags')),
				...extantTags.map(this._updateTag),
				...newCollections.map(this._createEntity('collections')),
				...extantCollections.map(this._updateCollection),
				...newRedirects.map(this._createEntity('redirects')),
				...extantRedirects.map(this._updateRedirect)
			])
		]
	}

	_findOrInitEntityByProperty = <T extends Entity>(
		table: Table,
		property: keyof T["attributes"]
	): (entityAttributes: T["attributes"]) => Promise<T> =>
		async (entityAttributes: T["attributes"]): Promise<T> => {
			try {
				const entity: T = (await this.strapi.find<T[]>(table, {
					filters: {
						[property]: {
							$eq: entityAttributes[property]
						}
					}
				})).data[0]

				entity.attributes = entityAttributes

				return entity
			} catch (e: any) {
				if (e.error.name !== "NotFoundError") {
					throw e
				}

				return {
					id: undefined,
					attributes: entityAttributes,
					meta: {}
				} as T
			}
		}

	_createEntity = <T extends Entity>(table: Table) =>
		async(entity: T): Promise<T> =>
			(await this.strapi.create<T>(table, entity.attributes)).data

	_updateArticle = async (article: Article): Promise<Article> =>
		(await this.strapi.update<Article>('articles', article.id!, article.attributes)).data

	_exists = (entity: Entity) => !!entity.id

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

	_updateTag = async (tag: Tag): Promise<Tag> =>
		(await this.strapi.update<Tag>('tags', tag.id!, tag.attributes)).data

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

	_updateRedirect = async (redirect: Redirect): Promise<Redirect> =>
		(await this.strapi.update<Redirect>('redirects', redirect.id!, redirect.attributes)).data
}
