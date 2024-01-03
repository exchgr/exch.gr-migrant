import {ArticleAttributes} from "types/ArticleAttributes"

export type Article = {
	id?: number
	attributes: ArticleAttributes
	meta: Record<string, unknown>
}
