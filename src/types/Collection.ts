import {CollectionAttributes} from "types/CollectionAttributes"

export type Collection = {
	id?: number
	attributes: CollectionAttributes
	meta: Record<string, unknown>
}
