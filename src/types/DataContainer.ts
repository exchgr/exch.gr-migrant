import {ArticleAttributes} from "types/ArticleAttributes"
import {TagAttributes} from "types/TagAttributes"
import {CollectionAttributes} from "types/CollectionAttributes"
import {ArticleTag} from "types/ArticleTag"
import {CollectionArticles} from "types/CollectionArticles"

export type DataContainer = {
	articleAttributesCollection: ArticleAttributes[]
	articleTags: ArticleTag[]
	tagAttributesCollection: TagAttributes[]
	collectionAttributesCollection: CollectionAttributes[]
	collectionArticles: CollectionArticles
}
