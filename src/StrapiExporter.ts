import {Article} from "types/Article"
import {ArticleAttributes} from "types/ArticleAttributes"
import Strapi, {StrapiResponse} from "strapi-sdk-js"
import {partition} from "./lib/util"
import {TagAttributes} from "types/TagAttributes"
import {Tag} from "types/Tag"
import {DataContainer} from "types/DataContainer"

export class StrapiExporter {
	private strapi: Strapi

	constructor(strapi: Strapi) {
		this.strapi = strapi
	}

	export = async (dataContainer: DataContainer): Promise<StrapiResponse<unknown>[]> => {
		const [extantArticles, newArticles]: Article[][] = partition(
			await Promise.all(dataContainer.articleAttributesCollection.map(this._findOrInitArticle)),
			this._exists
		)

		const [extantTags, newTags]: Tag[][] = partition(
			await Promise.all(dataContainer.tagAttributesCollection.map(this._findOrInitTag)),
			this._exists
		)

		return await Promise.all([
			...extantArticles.map(this._updateArticle),
			...newArticles.map(this._createArticle),
			...newTags.map(this._createTag),
			...extantTags.map(this._updateTag)
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

	_createArticle = (article: Article): Promise<StrapiResponse<unknown>> =>
		this.strapi.create('articles', article.attributes)

	_updateArticle = (article: Article): Promise<StrapiResponse<unknown>> =>
		this.strapi.update('articles', article.id!, article.attributes)

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

	_createTag = (tag: Tag): Promise<StrapiResponse<unknown>> =>
		this.strapi.create('tags', tag.attributes)

	_updateTag = (tag: Tag): Promise<StrapiResponse<unknown>> =>
		this.strapi.update('tags', tag.id!, tag.attributes)
}
