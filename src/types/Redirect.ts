import {RedirectAttributes} from "types/RedirectAttributes"

export type Redirect = {
	id?: number
	attributes: RedirectAttributes
	meta: Record<string, unknown>
}
