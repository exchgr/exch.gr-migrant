import {Tag} from "types/Tag"
import {Article} from "types/Article"
import {Collection} from "types/Collection"
import {Redirect} from "types/Redirect"

export type DatumContainer = {
	article: Article,
	tags: Tag[],
	collection: Collection,
	redirect: Redirect
}
