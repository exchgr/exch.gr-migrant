import {PostTag} from "PostTag"
import {Tag} from "Tag"
import {Post} from "Post"

export type DatumContainer = {
	post: Post,
	tags: Tag[],
	postTags: PostTag[]
}
