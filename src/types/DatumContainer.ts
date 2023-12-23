import {PostTag} from "types/PostTag"
import {Tag} from "types/Tag"
import {Post} from "types/Post"

export type DatumContainer = {
	post: Post,
	tags: Tag[],
}
