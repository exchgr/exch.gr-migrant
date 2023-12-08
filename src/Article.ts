import {Post} from "Post"

export type Article = {
	id?: number
	attributes: Post
	meta: Record<string, unknown>
}
