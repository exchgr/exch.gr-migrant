import {ArticleAttributes} from "types/ArticleAttributes"
import {TagAttributes} from "types/TagAttributes"
import {CollectionAttributes} from "types/CollectionAttributes"
import {CollectionArticles} from "types/CollectionArticles"
import {TagArticles} from "types/TagArticles"

export type DataContainer = {
	articleAttributesCollection: ArticleAttributes[]
	tagAttributesCollection: TagAttributes[]
	tagArticles: TagArticles
	collectionAttributesCollection: CollectionAttributes[]
	collectionArticles: CollectionArticles
}
