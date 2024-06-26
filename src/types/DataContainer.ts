import {Article} from "types/Article"
import {Tag} from "types/Tag"
import {Collection} from "types/Collection"
import {Connection} from "types/Connection"
import {Redirect} from "types/Redirect"

export type DataContainer = {
	articleAttributesCollection: Article[]
	tagAttributesCollection: Tag[]
	tagArticles: Connection<Article["slug"][]>
	collectionAttributesCollection: Collection[]
	collectionArticles: Connection<Article["slug"][]>
	redirectAttributesCollection: Redirect[]
	redirectArticles: Connection<Article["slug"]>
}
