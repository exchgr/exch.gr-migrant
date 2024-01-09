import {TagAttributes} from "types/TagAttributes"
import {ArticleAttributes} from "types/ArticleAttributes"
import {CollectionAttributes} from "types/CollectionAttributes"

export type DatumContainer = {
	articleAttributes: ArticleAttributes,
	tagAttributesCollection: TagAttributes[],
	collectionAttributes: CollectionAttributes
}
