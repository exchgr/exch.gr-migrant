import {partition, syncMap} from "../lib/util"
import {DataContainer} from "types/DataContainer"
import {Connection} from "types/Connection"
import {Entity} from "types/Entity"
import {Table} from "types/Table"
import {Attributes} from "types/Attributes"
import qs from "qs"
import {URL} from "url"

export class StrapiExporter {
	private readonly fetch: typeof fetch
	private readonly strapiUrl: string
	private readonly strapiToken: string

	constructor(
		fetche: typeof fetch,
		strapiUrl: string,
		strapiToken: string,
	) {
		this.fetch = fetche
		this.strapiUrl = strapiUrl
		this.strapiToken = strapiToken
	}

	export = async (dataContainer: DataContainer): Promise<Entity<Attributes>[]> => {
		const [extantArticles, newArticles] = partition(
			await Promise.all(dataContainer.articleAttributesCollection.map(
				this._findOrInitEntityByProperty('articles', 'slug')
			)),
			StrapiExporter._exists
		)

		const ensuredArticles = [
			...await syncMap(newArticles, this._createEntity('articles')),
			...await syncMap(extantArticles, this._updateEntity('articles'))
		]

		const [extantTags, newTags] = partition(
			StrapiExporter._connectEntitiesOneToMany(
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
			StrapiExporter._exists
		)

		const [extantCollections, newCollections] = partition(
			StrapiExporter._connectEntitiesOneToMany(
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
			StrapiExporter._exists
		)

		const [extantRedirects, newRedirects] = partition(
			StrapiExporter._connectEntitiesOneToOne(
				dataContainer.redirectArticles,
				ensuredArticles,
				await Promise.all(
					dataContainer.redirectAttributesCollection.map(this._findOrInitEntityByProperty('redirects', 'from'))
				),
				"to",
				"slug",
				"from"
			),
			StrapiExporter._exists
		)

		return [
			...ensuredArticles,
			...await syncMap(newTags, this._createEntity('tags')),
			...await syncMap(extantTags, this._updateEntity('tags')),
			...await syncMap(newCollections, this._createEntity('collections')),
			...await syncMap(extantCollections, this._updateEntity('collections')),
			...await syncMap(newRedirects, this._createEntity('redirects')),
			...await syncMap(extantRedirects, this._updateEntity('redirects')),
		]
	}

	_findOrInitEntityByProperty = <T extends Attributes>(
		table: Table,
		property: keyof T
	) => async (entityAttributes: T): Promise<Entity<T>> => {
		const response = await this.fetch(
			new URL(
				`/api/${table}?${qs.stringify(
					{
						filters: {
							[property]: {
								$eq: entityAttributes[property]
							}
						}
					},
					{encode: false},
				)}`,
				this.strapiUrl,
			),
			{
				headers: {'Authorization': `bearer ${this.strapiToken}`}
			}
		)

		if (!response.ok) {
			throw new Error(`Error: ${response.status} ${response.statusText}`)
		}

		const entity: Entity<T> = (await response.json()).data[0] || {
			id: undefined,
			attributes: undefined,
			meta: {}
		}

		entity.attributes = entityAttributes
		return entity
	}

	_createEntity = <T extends Attributes>(table: Table) =>
		async(entity: Entity<T>): Promise<Entity<T>> => {
			const response = await this.fetch(
				new URL(`/api/${table}`, this.strapiUrl),
				{
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `bearer ${this.strapiToken}`
					},
					body: JSON.stringify({
						data: entity.attributes
					})
				}
			)

			if (!response.ok) {
				const {error} = await response.json()
				throw new Error(`Error: ${response.status} ${response.statusText}
${error.name}: ${error.message}`)
			}

			return (await response.json()).data
		}

	_updateEntity = <T extends Attributes>(table: Table) =>
		async (entity: Entity<T>): Promise<Entity<T>> => {
			const response = await this.fetch(
				new URL(`/api/${table}/${entity.id!}`, this.strapiUrl),
				{
					method: "PUT",
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `bearer ${this.strapiToken}`
					},
					body: JSON.stringify({
						data: entity.attributes
					})
				}
			)

			if (!response.ok) {
				throw new Error(`Error: ${response.status} ${response.statusText}`)
			}

			return (await response.json()).data
		}

	static _exists = <T extends Attributes>(entity: Entity<T>) => !!entity.id

	static _connectEntitiesOneToMany = <
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
				[connectionField]: {
					connect: tEntities.filter((tEntity) =>
						connections[uEntity.attributes[uConnectionKey] as string]
							.includes(tEntity.attributes[tConnectionKey] as string)
					).map((entity) => entity.id!)
				}
			}
		}))

	static _connectEntitiesOneToOne = <
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
