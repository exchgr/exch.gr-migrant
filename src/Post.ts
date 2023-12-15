import {Tag} from "Tag"

export type Post = {
	title: string
	body: string
	createdAt: Date
	publishedAt: Date
	updatedAt: Date
	slug: string
	author: string
	collection: string
	og_type: string
}
