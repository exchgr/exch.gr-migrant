import Strapi from "strapi-sdk-js"
import {partition, promiseSequence} from "../lib/util"
import {DataContainer} from "types/DataContainer"
import {Connection} from "types/Connection"
import {Entity} from "types/Entity"
import {Table} from "types/Table"
import {Attributes} from "types/Attributes"

export class StrapiExporter {
	private strapi: Strapi

	constructor(strapi: Strapi) {
		this.strapi = strapi
	}

	export = async (dataContainer: DataContainer): Promise<Entity<Attributes>[]> => {
		const [extantArticles, newArticles] = partition(
			await Promise.all(dataContainer.articleAttributesCollection.map(
				this._findOrInitEntityByProperty('articles', 'slug')
			)),
			this._exists
		)

		const ensuredArticles = await promiseSequence([
			...newArticles.map(this._createEntity('articles')),
			...extantArticles.map(this._updateEntity('articles')),
		])


		const [extantTags, newTags] = partition(
			this._connectEntitiesOneToMany(
				dataContainer.tagArticles,
				ensuredArticles,
				await Promise.all(
					dataContainer.tagAttributesCollection.map(
						this._findOrInitEntityByProperty('tags', 'slug')
					)
				),
				"articles",
				"slug",
				"slug"
			),
			this._exists
		)

		const [extantCollections, newCollections] = partition(
			this._connectEntitiesOneToMany(
				dataContainer.collectionArticles,
				ensuredArticles,
				await Promise.all(
					dataContainer.collectionAttributesCollection.map(
						this._findOrInitEntityByProperty('collections', 'slug')
					)
				),
				"articles",
				"slug",
				"slug"
			),
			this._exists
		)

		const [extantRedirects, newRedirects] = partition(
			this._connectEntitiesOneToOne(
				dataContainer.redirectArticles,
				ensuredArticles,
				await Promise.all(
					dataContainer.redirectAttributesCollection.map(this._findOrInitEntityByProperty('redirects', 'from'))
				),
				"to",
				"slug",
				"from"
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

	_connectEntitiesOneToMany = <
		T extends Attributes,
		U extends Attributes
	>(
		connections: Connection<string[]>,
		tEntities: Entity<T>[],
		uEntities: Entity<U>[],
		connectionField: keyof U,
		tConnectionKey: keyof T,
		uConnectionKey: keyof U,
	): Entity<U>[] =>
		uEntities.map((uEntity) => ({
			...uEntity,
			attributes: {
				...uEntity.attributes,
				[connectionField]: tEntities.filter((tEntity) =>
					connections[uEntity.attributes[uConnectionKey] as string]
						.includes(tEntity.attributes[tConnectionKey] as string)
				).map((entity) => entity.id!)
			}
		}))

	_connectEntitiesOneToOne = <
		T extends Attributes,
		U extends Attributes
	>(
		connections: Connection<string>,
		tEntities: Entity<T>[],
		uEntities: Entity<U>[],
		connectionField: keyof U,
		tConnectionKey: keyof T,
		uConnectionKey: keyof U
	): Entity<U>[] =>
		uEntities.map((uEntity) => ({
			...uEntity,
			attributes: {
				...uEntity.attributes,
				[connectionField]: tEntities.filter((tEntity) =>
					connections[uEntity.attributes[uConnectionKey] as string]
						.includes(tEntity.attributes[tConnectionKey] as string)
				)[0].id!
			}
		}))
}
