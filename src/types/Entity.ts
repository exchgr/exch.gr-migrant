import {Attributes} from "types/Attributes"

export interface Entity<T extends Attributes> {
	id?: number
	attributes: T
	meta: Record<string, unknown>
}
