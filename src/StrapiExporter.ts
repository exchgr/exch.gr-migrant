import {Article} from "types/Article"
import {Post} from "types/Post"
import Strapi, {StrapiResponse} from "strapi-sdk-js"
import {partition} from "./lib/util"

export class StrapiExporter {
	private strapi: Strapi

	constructor(strapi: Strapi) {
		this.strapi = strapi
	}

	export = async (posts: Post[]): Promise<StrapiResponse<unknown>[]> => {
		const [extantArticles, newArticles] = partition(
			await Promise.all(posts.map(this._findOrInitArticle)),
			this._articleExists
		)

		return [
			...await Promise.all(extantArticles.map(this._updateArticle)),
			...await Promise.all(newArticles.map(this._createArticle))
		]
	}

	_findOrInitArticle = async (post: Post): Promise<Article> => {
		try {
			const article = (await this.strapi.find<Article[]>('articles', {
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
}
