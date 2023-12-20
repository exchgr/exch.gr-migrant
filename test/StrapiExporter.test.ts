import Strapi, {
	StrapiError,
	StrapiRequestParams,
	StrapiResponse
} from "strapi-sdk-js"
import {stub} from "sinon"
import chai, {expect} from "chai"
import sinonChai from "sinon-chai"
import chaiAsPromised from "chai-as-promised"
import {Post} from "../src/types/Post"
import {StrapiExporter} from "../src/StrapiExporter"
import {Article} from "../src/types/Article"

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe("StrapiExporter", () => {
	const strapiUrl = "http://localhost:1337"

	describe("export", () => {
		it("should update extant articles and create new ones", async () => {
			const hiSlug = "hi"
			const heySlug = "hey"

			const hiPost: Post = {
				title: "hi",
				body: "<article>hi</article>",
				slug: hiSlug,
				author: "me",
				collection: "poasts",
				og_type: "poast",
				createdAt: new Date(),
				updatedAt: new Date(),
				publishedAt: new Date()
			}

			const heyPost: Post = {
				title: "hey",
				body: "<article>hey</article>",
				slug: heySlug,
				author: "me",
				collection: "poasts",
				og_type: "poast",
				createdAt: new Date(),
				updatedAt: new Date(),
				publishedAt: new Date()
			}

			const strapi = new Strapi({ url: strapiUrl })

			const strapiExporter = new StrapiExporter(strapi)

			const hiArticle = {
				id: 12345,
				attributes: hiPost,
				meta: {}
			}

			const heyArticle = {
				attributes: heyPost,
				meta: {}

			}

			stub(strapiExporter, "_findOrInitArticle")
				.withArgs(hiPost).resolves(hiArticle)
				.withArgs(heyPost).resolves(heyArticle)

			stub(strapiExporter, "_articleExists")
				.withArgs(hiArticle).returns(true)
				.withArgs(heyArticle).returns(false)

			stub(strapiExporter, "_updateArticle").withArgs(hiArticle).resolves({
					data: {},
					meta: {}
				})

			stub(strapiExporter, "_createArticle").withArgs(heyArticle).resolves({
				data: {},
				meta: {}
			})

			await strapiExporter.export([
				hiPost,
				heyPost
			])

			expect(strapiExporter._findOrInitArticle).to.have.been.calledWith(hiPost)
			expect(strapiExporter._findOrInitArticle).to.have.been.calledWith(heyPost)
			expect(strapiExporter._articleExists).to.have.been.calledWith(hiArticle)
			expect(strapiExporter._articleExists).to.have.been.calledWith(heyArticle)
			expect(strapiExporter._updateArticle).to.have.been.calledWith(hiArticle)
			expect(strapiExporter._createArticle).to.have.been.calledWith(heyArticle)
		})
	})

	describe("_findOrInitArticle", () => {
		const date = new Date()

		it("should return an existing article, updated with incoming post data", async () => {
			const id = 12345

			const hiSlug = "hi"

			const hiPost: Post = {
				title: "hi",
				body: "<article>hi</article>",
				slug: hiSlug,
				author: "me",
				collection: "poasts",
				og_type: "poast",
				createdAt: date,
				updatedAt: date,
				publishedAt: date
			}

			const hiQueryParams: StrapiRequestParams = {
				filters: {
					slug: {
						$eq: hiSlug
					}
				}
			}

			const article: Article = {
				id: id,
				attributes: hiPost,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			stub(strapi, "find").withArgs('articles', hiQueryParams).resolves({
				data: [{
					id: id,
					attributes: {
						slug: hiSlug
					},
					meta: {}
				}],
				meta: {}
			} as StrapiResponse<Article[]>)

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._findOrInitArticle(hiPost)).to.deep.eq(article)
		})

		it("should return a new article if one doesn't exist", async () => {
			const heySlug = "hey"

			const heyPost: Post = {
				title: "hey",
				body: "<article>hey</article>",
				slug: heySlug,
				author: "me",
				collection: "poasts",
				og_type: "poast",
				createdAt: date,
				updatedAt: date,
				publishedAt: date
			}

			const heyQueryParams: StrapiRequestParams = {
				filters: {
					slug: {
						$eq: heySlug
					}
				}
			}

			const article: Article = {
				id: undefined,
				attributes: heyPost,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			stub(strapi, "find").withArgs('articles', heyQueryParams).rejects({
				data: null,
				error: {
					status: 404,
					name: "NotFoundError",
					message: "Not Found",
					details: {},
				},
			} as StrapiError)

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._findOrInitArticle(heyPost)).to.deep.eq(article)
		})

		it("should rethrow all other errors", async () => {
			const heySlug = "hey"

			const heyPost: Post = {
				title: "hey",
				body: "<article>hey</article>",
				slug: heySlug,
				author: "me",
				collection: "poasts",
				og_type: "poast",
				createdAt: date,
				updatedAt: date,
				publishedAt: date
			}

			const heyQueryParams: StrapiRequestParams = {
				filters: {
					slug: {
						$eq: heySlug
					}
				}
			}

			const error = {
				status: 502,
				name: "BadGatewayError",
				message: "Bad Gateway",
				details: {},
			}

			const strapi = new Strapi({ url: strapiUrl })

			stub(strapi, "find").withArgs('articles', heyQueryParams).rejects({
				data: null,
				error: error,
			} as StrapiError)

			const strapiExporter = new StrapiExporter(strapi)

			expect(strapiExporter._findOrInitArticle(heyPost)).to.be.rejectedWith(error)
		})
	})

	describe("_createArticle", () => {
		it("should create a new article", () => {
			const heyPost: Post = {
				title: "hey",
				body: "<article>hey</article>",
				slug: "hey",
				author: "me",
				collection: "poasts",
				og_type: "poast",
				createdAt: new Date(),
				updatedAt: new Date(),
				publishedAt: new Date()
			}

			const article: Article = {
				id: undefined,
				attributes: heyPost,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			stub(strapi, "create").withArgs('articles', heyPost).resolves({
				data: {},
				meta: {}
			})

			const strapiExporter = new StrapiExporter(strapi)

			strapiExporter._createArticle(article)

			expect(strapi.create).to.have.been.calledWith('articles', heyPost)
		})
	})

	describe("_updateArticle", () => {
		it("should update an existing article", () => {
			const id = 12345

			const hiPost: Post = {
				title: "hi",
				body: "<article>hi</article>",
				slug: "hi",
				author: "me",
				collection: "poasts",
				og_type: "poast",
				createdAt: new Date(),
				updatedAt: new Date(),
				publishedAt: new Date()
			}

			const article: Article = {
				id: id,
				attributes: hiPost,
				meta: {}
			}

			const strapi = new Strapi({url: strapiUrl})

			stub(strapi, "update").withArgs('articles', id, hiPost).resolves({
				data: {},
				meta: {}
			})

			const strapiExporter = new StrapiExporter(strapi)

			strapiExporter._updateArticle(article)

			expect(strapi.update).to.have.been.calledWith('articles', id, hiPost)
		})
	})

	describe("_articleExists", () => {
		it("should return true if article has an id", () => {
			const article: Article = {
				id: 12345,
				attributes: {
					title: "hi",
					body: "<article>hi</article>",
					slug: "hi",
					author: "me",
					collection: "poasts",
					og_type: "poast",
					createdAt: new Date(),
					updatedAt: new Date(),
					publishedAt: new Date()
				},
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			const strapiExporter = new StrapiExporter(strapi)

			expect(strapiExporter._articleExists(article)).to.be.true
		})

		it("should return false if article has no id", () => {
			const article: Article = {
				attributes: {
					title: "hey",
					body: "<article>hey</article>",
					slug: "hey",
					author: "me",
					collection: "poasts",
					og_type: "poast",
					createdAt: new Date(),
					updatedAt: new Date(),
					publishedAt: new Date()
				},
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			const strapiExporter = new StrapiExporter(strapi)

			expect(strapiExporter._articleExists(article)).to.be.false
		})
	})
})
