import {TagAttributes} from "types/TagAttributes"

export type Tag = {
	id?: number
	attributes: TagAttributes
	meta: Record<string, unknown>
}
