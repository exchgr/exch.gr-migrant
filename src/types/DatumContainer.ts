import {ArticleTag} from "types/ArticleTag"
import {TagAttributes} from "types/TagAttributes"
import {ArticleAttributes} from "types/ArticleAttributes"

export type DatumContainer = {
	articleAttributes: ArticleAttributes,
	tagAttributesCollection: TagAttributes[],
}
