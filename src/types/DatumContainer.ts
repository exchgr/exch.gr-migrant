import {Tag} from "types/Tag"
import {Article} from "types/Article"
import {Collection} from "types/Collection"
import {Redirect} from "types/Redirect"

export type DatumContainer = {
	articleAttributes: Article,
	tagAttributesCollection: Tag[],
	collectionAttributes: Collection,
	redirectAttributes: Redirect
}
