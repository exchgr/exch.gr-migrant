import {Post} from "types/Post"

export type Article = {
	id?: number
	attributes: Post
	meta: Record<string, unknown>
}
