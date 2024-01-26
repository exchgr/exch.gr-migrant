import {DatumContainer} from "types/DatumContainer"
import {DataContainer} from "types/DataContainer"
import {Collection} from "types/Collection"
import {Tag} from "types/Tag"
import {Article} from "types/Article"
import {Redirect} from "types/Redirect"
import {Attributes} from "types/Attributes"
import {Connection} from "types/Connection"

export class DataContainerCollater {
	collate = (datumContainers: DatumContainer[]): DataContainer => {
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

			tagArticles: datumContainers.reduce(
				this._connectAttributesManyToMany<Tag, Article>(
					"tagAttributesCollection",
					"slug",
					"articleAttributes",
					"slug"
				),
				{}
			),

			collectionArticles: datumContainers.reduce(
				this._connectAttributesOneToMany<Collection, Article>(
					"collectionAttributes",
					"slug",
					"articleAttributes",
					"slug"
				),
				{}
			),

			redirectAttributesCollection: datumContainers.map((datumContainer: DatumContainer) => (
				datumContainer.redirectAttributes
			)),

			redirectArticles: datumContainers.reduce(
				this._connectAttributesOneToOne<Redirect, Article>(
					"redirectAttributes",
					"from",
					"articleAttributes",
					"slug"
				),
				{}
			)
		}
	}

	_connectAttributesManyToMany = <
		T extends Attributes,
		U extends Attributes
	>(
		datumContainerTKey: keyof DatumContainer,
		tKey: keyof T,
		datumContainerUKey: keyof DatumContainer,
		uKey: keyof U
	) => (
		connections: Connection<string[]>,
		datumContainer: DatumContainer,
	): Connection<string[]> => {
		(datumContainer[datumContainerTKey] as T[]).forEach((t) => {
			connections[t[tKey] as string] ||= []
			connections[t[tKey] as string].push(
				(datumContainer[datumContainerUKey] as U)[uKey] as string
			)
		})

		return connections
	}

	_connectAttributesOneToMany = <
		T extends Attributes,
		U extends Attributes
	>(
		datumContainerTKey: keyof DatumContainer,
		tKey: keyof T,
		datumContainerUKey: keyof DatumContainer,
		uKey: keyof U
	) => (
		connections: Connection<string[]>,
		datumContainer: DatumContainer
	): Connection<string[]> => {
		connections[(datumContainer[datumContainerTKey] as T)[tKey] as string]
			||= []

		connections[(datumContainer[datumContainerTKey] as T)[tKey] as string]
			.push((datumContainer[datumContainerUKey] as U)[uKey] as string)

		return connections
	}

	_connectAttributesOneToOne = <
		T extends Attributes,
		U extends Attributes
	>(
		datumContainerTKey: keyof DatumContainer,
		tKey: keyof T,
		datumContainerUKey: keyof DatumContainer,
		uKey: keyof U
	) => (
		connections: Connection<string>,
		datumContainer: DatumContainer
	): Connection<string> => {
		connections[(datumContainer[datumContainerTKey] as T)[tKey] as string] =
			(datumContainer[datumContainerUKey] as U)[uKey] as string

		return connections
	}
}
