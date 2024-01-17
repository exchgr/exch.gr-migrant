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
import {Attributes} from "types/Attributes"

export class StrapiExporter {
	private strapi: Strapi

	constructor(strapi: Strapi) {
		this.strapi = strapi
	}

	export = async (dataContainer: DataContainer): Promise<Entity<Attributes>[]> => {
		const array = await Promise.all(dataContainer.articleAttributesCollection.map(
			this._findOrInitEntityByProperty('articles', 'slug')
		))
		const [extantArticles, newArticles] = partition(
			array,
			this._exists
		)

		const ensuredArticles = await promiseSequence([
			...newArticles.map(this._createEntity('articles')),
			...extantArticles.map(this._updateEntity('articles')),
		])


		const [extantTags, newTags] = partition(
			this._connectArticlesToTags(
				dataContainer.tagArticles,
				ensuredArticles,
				await Promise.all(
					dataContainer.tagAttributesCollection.map(
						this._findOrInitEntityByProperty('tags', 'slug')
					)
				)
			),
			this._exists
		)

		const [extantCollections, newCollections] = partition(
			this._connectArticlesToCollections(
				dataContainer.collectionArticles,
				ensuredArticles,
				await Promise.all(
					dataContainer.collectionAttributesCollection.map(
						this._findOrInitEntityByProperty('collections', 'slug')
					)
				)
			),
			this._exists
		)

		const [extantRedirects, newRedirects] = partition(
			await Promise.all(
				dataContainer.redirectAttributesCollection.map(this._findOrInitEntityByProperty('redirects', 'from'))
			),
			this._exists
		)

		return [
			...ensuredArticles,
			...await promiseSequence<Entity<Attributes>>([
				...newTags.map(this._createEntity('tags')),
				...extantTags.map(this._updateEntity('tags')),
				...newCollections.map(this._createEntity('collections')),
				...extantCollections.map(this._updateEntity('collections')),
				...newRedirects.map(this._createEntity('redirects')),
				...extantRedirects.map(this._updateEntity('redirects'))
			])
		]
	}

	_findOrInitEntityByProperty = <T extends Attributes>(
		table: Table,
		property: keyof T
	) =>
		async (entityAttributes: T): Promise<Entity<T>> => {
			try {
				const entity = (await this.strapi.find<Entity<T>[]>(table, {
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
				}
			}
		}

	_createEntity = <T extends Attributes>(table: Table) =>
		async(entity: Entity<T>): Promise<Entity<T>> =>
			(await this.strapi.create<Entity<T>>(table, entity.attributes)).data

	_updateEntity = <T extends Attributes>(table: Table) =>
		async (entity: Entity<T>): Promise<Entity<T>> =>
			(await this.strapi.update<Entity<T>>(table, entity.id!, entity.attributes)).data

	_exists = <T extends Attributes>(entity: Entity<T>) => !!entity.id

	_connectArticlesToTags = (tagArticles: TagArticles, articles: Entity<Article>[], tags: Entity<Tag>[]): Entity<Tag>[] =>
		tags.map((tag): Entity<Tag> => ({
			...tag,
			attributes: {
				...tag.attributes,
				articles: articles.filter((article) =>
					tagArticles[tag.attributes.slug].includes(article.attributes.slug)
				).map((article): number => article.id!)
			}
		}))

	_connectArticlesToCollections = (
		collectionArticles: CollectionArticles,
		articles: Entity<Article>[],
		collections: Entity<Collection>[]
	): Entity<Collection>[] =>
		collections.map((collection) => ({
			...collection,
			attributes: {
				...collection.attributes,
				articles: articles.filter((article) =>
					collectionArticles[collection.attributes.slug].includes(article.attributes.slug )
				).map((article) => article.id!)
			}
		}))
}
