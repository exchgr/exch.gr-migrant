import {DatumContainer} from "types/DatumContainer"
import {DataContainer} from "types/DataContainer"
import {Collection} from "types/Collection"
import {Tag} from "types/Tag"
import {Article} from "types/Article"
import {Redirect} from "types/Redirect"
import {Attributes} from "types/Attributes"
import {Connection} from "types/Connection"

export const collateDataContainer: (datumContainers: DatumContainer[]) => DataContainer = (datumContainers: DatumContainer[]): DataContainer => {
	const seenTagSlugs: string[] = []
	const seenCollectionSlugs: string[] = []

	return {
		articleAttributesCollection: datumContainers.map((datumContainer) =>
			datumContainer.article
		),

		tagAttributesCollection: datumContainers.flatMap((datumContainer) =>
			datumContainer.tags
		).filter((tagAttributes) =>
			seenTagSlugs.includes(tagAttributes.slug) ? false : seenTagSlugs.push(tagAttributes.slug)
		),

		collectionAttributesCollection: datumContainers.map((datumContainer) =>
			datumContainer.collection
		).filter((collectionAttributes: Collection) =>
			seenCollectionSlugs.includes(collectionAttributes.slug) ? false : seenCollectionSlugs.push(collectionAttributes.slug)
		),

		tagArticles: datumContainers.reduce(
			_connectAttributesManyToMany<Tag, Article>(
				"tags",
				"slug",
				"article",
				"slug"
			),
			{}
		),

		collectionArticles: datumContainers.reduce(
			_connectAttributesOneToMany<Collection, Article>(
				"collection",
				"slug",
				"article",
				"slug"
			),
			{}
		),

		redirectAttributesCollection: datumContainers.map((datumContainer: DatumContainer) => (
			datumContainer.redirect
		)),

		redirectArticles: datumContainers.reduce(
			_connectAttributesOneToOne<Redirect, Article>(
				"redirect",
				"from",
				"article",
				"slug"
			),
			{}
		)
	}
}

export const _connectAttributesManyToMany = <
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

export const _connectAttributesOneToMany = <
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

export const _connectAttributesOneToOne = <
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
