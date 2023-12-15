import {Post} from "Post"
import {Tag} from "Tag"
import {PostTag} from "PostTag"

export type DataContainer = {
	posts: Post[]
	postTags: PostTag[]
	tags: Tag[]
}
