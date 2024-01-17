import {Article} from "types/Article"
import {Tag} from "types/Tag"
import {Collection} from "types/Collection"
import {CollectionArticles} from "types/CollectionArticles"
import {TagArticles} from "types/TagArticles"
import {Redirect} from "types/Redirect"

export type DataContainer = {
	articleAttributesCollection: Article[]
	tagAttributesCollection: Tag[]
	tagArticles: TagArticles
	collectionAttributesCollection: Collection[]
	collectionArticles: CollectionArticles
	redirectAttributesCollection: Redirect[]
}
