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
		const [extantArticles, newArticles] = partition(
			await Promise.all(dataContainer.articleAttributesCollection.map(this._findOrInitArticle)),
			this._articleExists
		)

		const tags = await Promise.all(dataContainer.tagAttributesCollection.map(this._findOrInitTag))

		return [
			...await Promise.all(extantArticles.map(this._updateArticle)),
			...await Promise.all(newArticles.map(this._createArticle))
		]
	}

	_findOrInitArticle = async (post: ArticleAttributes): Promise<Article> => {
		try {
			const article: Article = (await this.strapi.find<Article[]>('articles', {
				filters: {
					slug: {
						$eq: post.slug
					}
				}
			})).data[0]

			article.attributes = post

			return article
		} catch (e: any) {
			if (e.error.name !== "NotFoundError") {
				throw e
			}

			return {
				id: undefined,
				attributes: post,
				meta: {}
			} as Article
		}
	}

	_createArticle = async (article: Article): Promise<StrapiResponse<unknown>> =>
		await this.strapi.create('articles', article.attributes)

	_updateArticle = async (article: Article): Promise<StrapiResponse<unknown>> =>
		await this.strapi.update('articles', article.id!, article.attributes)

	_articleExists = (article: Article) => !!article.id

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
}
