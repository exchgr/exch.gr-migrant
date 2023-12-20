import {Post} from "types/Post"
import {Tag} from "types/Tag"
import {PostTag} from "types/PostTag"

export type DataContainer = {
	posts: Post[]
	postTags: PostTag[]
	tags: Tag[]
}
