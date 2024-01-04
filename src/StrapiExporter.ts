import {Article} from "types/Article"
import {ArticleAttributes} from "types/ArticleAttributes"
import Strapi, {StrapiResponse} from "strapi-sdk-js"
import {partition, promiseSequence} from "./lib/util"
import {TagAttributes} from "types/TagAttributes"
import {Tag} from "types/Tag"
import {DataContainer} from "types/DataContainer"

export class StrapiExporter {
	private strapi: Strapi

	constructor(strapi: Strapi) {
		this.strapi = strapi
	}

	export = async (dataContainer: DataContainer): Promise<(Article | Tag)[]> => {
		const [extantArticles, newArticles]: Article[][] = partition(
			await Promise.all(dataContainer.articleAttributesCollection.map(this._findOrInitArticle)),
			this._exists
		)

		const [extantTags, newTags]: Tag[][] = partition(
			await Promise.all(dataContainer.tagAttributesCollection.map(this._findOrInitTag)),
			this._exists
		)

		return await promiseSequence<Article | Tag>([
			...newTags.map(this._createTag),
			...extantTags.map(this._updateTag),
			...newArticles.map(this._createArticle),
			...extantArticles.map(this._updateArticle),
		])
	}

	_findOrInitArticle = async (articleAttributes: ArticleAttributes): Promise<Article> => {
		try {
			const article: Article = (await this.strapi.find<Article[]>('articles', {
				filters: {
					slug: {
						$eq: articleAttributes.slug
					}
				}
			})).data[0]

			article.attributes = articleAttributes

			return article
		} catch (e: any) {
			if (e.error.name !== "NotFoundError") {
				throw e
			}

			return {
				id: undefined,
				attributes: articleAttributes,
				meta: {}
			} as Article
		}
	}

	_createArticle = async (article: Article): Promise<Article> =>
		(await this.strapi.create<Article>('articles', article.attributes)).data

	_updateArticle = async (article: Article): Promise<Article> =>
		(await this.strapi.update<Article>('articles', article.id!, article.attributes)).data

	_exists = (entity: Article | Tag) => !!entity.id

	_findOrInitTag = async (tagAttributes: TagAttributes): Promise<Tag> => {
		try {
			const tag: Tag = (await this.strapi.find<Tag[]>('tags', {
				filters: {
					slug: {
						$eq: tagAttributes.slug
					}
				}
			})).data[0]

			tag.attributes = tagAttributes

			return tag
		} catch (e: any) {
			if (e.error.name !== "NotFoundError") {
				throw e
			}

			return {
				id: undefined,
				attributes: tagAttributes,
				meta: {}
			} as Tag
		}
	}

	_createTag = async (tag: Tag): Promise<Tag> =>
		(await this.strapi.create<Tag>('tags', tag.attributes)).data

	_updateTag = async (tag: Tag): Promise<Tag> =>
		(await this.strapi.update<Tag>('tags', tag.id!, tag.attributes)).data
}
