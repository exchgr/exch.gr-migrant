import {TagAttributes} from "types/TagAttributes"
import {ArticleAttributes} from "types/ArticleAttributes"
import {CollectionAttributes} from "types/CollectionAttributes"
import {RedirectAttributes} from "types/RedirectAttributes"

export type DatumContainer = {
	articleAttributes: ArticleAttributes,
	tagAttributesCollection: TagAttributes[],
	collectionAttributes: CollectionAttributes,
	redirectAttributes: RedirectAttributes
}
