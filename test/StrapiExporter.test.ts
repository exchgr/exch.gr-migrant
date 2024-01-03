import Strapi, {
	StrapiError,
	StrapiRequestParams,
	StrapiResponse
} from "strapi-sdk-js"
import {stub} from "sinon"
import chai, {expect} from "chai"
import sinonChai from "sinon-chai"
import chaiAsPromised from "chai-as-promised"
import {ArticleAttributes} from "../src/types/ArticleAttributes"
import {StrapiExporter} from "../src/StrapiExporter"
import {Article} from "../src/types/Article"
import {TagAttributes} from "../src/types/TagAttributes"
import {Tag} from "../src/types/Tag"
import {DataContainer} from "../src/types/DataContainer"

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe("StrapiExporter", () => {
	const strapiUrl = "http://localhost:1337"

	describe("export", () => {
		it("should update extant articles and create new ones", async () => {
			const hiSlug = "hi"
			const heySlug = "hey"

			const hiArticleAttributes: ArticleAttributes = {
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

			const heyArticleAttributes: ArticleAttributes = {
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

			const greetingsTagSlug = "greetings"

			const greetingsTagAttributes: TagAttributes = {
				name: "Greetings",
				slug: greetingsTagSlug
			}

			const greetingsTag: Tag = {
				id: 1,
				attributes: greetingsTagAttributes,
				meta: {}
			}

			const casualGreetingsTagSlug = "casual-greetings"

			const casualGreetingsTagAttributes: TagAttributes = {
				name: "Casual greetings",
				slug: casualGreetingsTagSlug
			}

			const casualGreetingsTag: Tag = {
				id: undefined,
				attributes: casualGreetingsTagAttributes,
				meta: {}
			}

			const dataContainer: DataContainer = {
				articleAttributesCollection: [
					hiArticleAttributes,
					heyArticleAttributes
				],
				tagAttributesCollection: [
					greetingsTagAttributes,
					casualGreetingsTagAttributes,
				],
				articleTags: [

				]
			}

			const strapi = new Strapi({ url: strapiUrl })

			const strapiExporter = new StrapiExporter(strapi)

			const hiArticle = {
				id: 12345,
				attributes: hiArticleAttributes,
				meta: {}
			}

			const heyArticle = {
				attributes: heyArticleAttributes,
				meta: {}

			}

			stub(strapiExporter, "_findOrInitArticle")
				.withArgs(hiArticleAttributes).resolves(hiArticle)
				.withArgs(heyArticleAttributes).resolves(heyArticle)

			stub(strapiExporter, "_exists")
				.withArgs(hiArticle).returns(true)
				.withArgs(heyArticle).returns(false)
				.withArgs(greetingsTag).returns(false)
				.withArgs(casualGreetingsTag).returns(true)

			const updateArticleSuccessResponse = {
				data: {type: "updateArticle"},
				meta: {}
			}

			stub(strapiExporter, "_updateArticle").withArgs(hiArticle).resolves(updateArticleSuccessResponse)

			const createArticleSuccessResponse = {
				data: {type: "createArticle"},
				meta: {}
			}

			stub(strapiExporter, "_createArticle").withArgs(heyArticle).resolves(createArticleSuccessResponse)

			stub(strapiExporter, "_findOrInitTag")
				.withArgs(greetingsTagAttributes).resolves(greetingsTag)
				.withArgs(casualGreetingsTagAttributes).resolves(casualGreetingsTag)

			const createTagSuccessResponse = {
				data: {type: "createTag"},
				meta: {}
			}

			stub(strapiExporter, "_createTag").withArgs(greetingsTag).resolves(createTagSuccessResponse)

			const updateTagSuccessResponse = {
				data: {type: "updateTag"},
				meta: {}
			}

			stub(strapiExporter, "_updateTag").withArgs(casualGreetingsTag).resolves(updateTagSuccessResponse)

			// eq guarantees order
			expect(await strapiExporter.export(dataContainer)).to.deep.eq([
				createTagSuccessResponse,
				updateTagSuccessResponse,
				createArticleSuccessResponse,
				updateArticleSuccessResponse,
			])
		})
	})

	describe("_findOrInitArticle", () => {
		const date = new Date()

		it("should return an existing article, updated with incoming articleAttributes data", async () => {
			const id = 12345

			const hiSlug = "hi"

			const hiArticleAttributes: ArticleAttributes = {
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
				attributes: hiArticleAttributes,
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

			expect(await strapiExporter._findOrInitArticle(hiArticleAttributes)).to.deep.eq(article)
		})

		it("should return a new article if one doesn't exist", async () => {
			const heySlug = "hey"

			const heyArticleAttributes: ArticleAttributes = {
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
				attributes: heyArticleAttributes,
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

			expect(await strapiExporter._findOrInitArticle(heyArticleAttributes)).to.deep.eq(article)
		})

		it("should rethrow all other errors", async () => {
			const heySlug = "hey"

			const heyArticleAttributes: ArticleAttributes = {
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

			expect(strapiExporter._findOrInitArticle(heyArticleAttributes)).to.be.rejectedWith(error)
		})
	})

	describe("_createArticle", () => {
		it("should create a new article", async () => {
			const heyArticleAttributes: ArticleAttributes = {
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
				attributes: heyArticleAttributes,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			const successResponse = {
				data: {},
				meta: {}
			}

			stub(strapi, "create").withArgs('articles', heyArticleAttributes).resolves(successResponse)

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._createArticle(article)).to.eq(successResponse)
		})
	})

	describe("_updateArticle", () => {
		it("should update an existing article", () => {
			const id = 12345

			const hiArticleAttributes: ArticleAttributes = {
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
				attributes: hiArticleAttributes,
				meta: {}
			}

			const strapi = new Strapi({url: strapiUrl})

			stub(strapi, "update").withArgs('articles', id, hiArticleAttributes).resolves({
				data: {},
				meta: {}
			})

			const strapiExporter = new StrapiExporter(strapi)

			strapiExporter._updateArticle(article)

			expect(strapi.update).to.have.been.calledWith('articles', id, hiArticleAttributes)
		})
	})

	describe("_exists", () => {
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

			expect(strapiExporter._exists(article)).to.be.true
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

			expect(strapiExporter._exists(article)).to.be.false
		})
	})

	describe("_findOrInitTag", () => {
		it("should return an existing tag, updated with incoming tagAttributes data", async () => {
			const id = 12345

			const hiSlug = "hi"

			const hiTagAttributes: TagAttributes = {
				name: hiSlug,
				slug: hiSlug
			}

			const hiQueryParams: StrapiRequestParams = {
				filters: {
					slug: {
						$eq: hiSlug
					}
				}
			}

			const hiTag: Tag = {
				id: id,
				attributes: hiTagAttributes,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			stub(strapi, "find").withArgs('tags', hiQueryParams).resolves({
				data: [{
					id: id,
					attributes: {
						slug: hiSlug
					},
					meta: {}
				}],
				meta: {}
			} as StrapiResponse<Tag[]>)

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._findOrInitTag(hiTagAttributes)).to.deep.eq(hiTag)
		})

		it("should return a new tag if one doesn't exist", async () => {
			const heySlug = "hey"

			const heyTagAttributes: TagAttributes = {
				name: "hey",
				slug: heySlug
			}

			const heyQueryParams: StrapiRequestParams = {
				filters: {
					slug: {
						$eq: heySlug
					}
				}
			}

			const heyTag: Tag = {
				id: undefined,
				attributes: heyTagAttributes,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			stub(strapi, "find").withArgs('tags', heyQueryParams).rejects({
				data: null,
				error: {
					status: 404,
					name: "NotFoundError",
					message: "Not Found",
					details: {},
				},
			} as StrapiError)

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._findOrInitTag(heyTagAttributes)).to.deep.eq(heyTag)
		})

		it("should rethrow all other errors", async () => {
			const heySlug = "hey"

			const heyTagAttributes: TagAttributes = {
				name: "hey",
				slug: heySlug,
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

			stub(strapi, "find").withArgs('tags', heyQueryParams).rejects({
				data: null,
				error: error,
			} as StrapiError)

			const strapiExporter = new StrapiExporter(strapi)

			expect(strapiExporter._findOrInitTag(heyTagAttributes)).to.be.rejectedWith(error)
		})
	})

	describe("_createTag", () => {
		it("should create a new tag", async () => {
			const heyTagAttributes: TagAttributes = {
				name: "hey",
				slug: "hey",
			}

			const heyTag: Tag = {
				id: undefined,
				attributes: heyTagAttributes,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			const successResponse = {
				data: {},
				meta: {}
			}

			stub(strapi, "create").withArgs('tags', heyTagAttributes).resolves(successResponse)

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._createTag(heyTag)).to.eq(successResponse)
		})
	})

	describe("_updateTag", () => {
		it("should update an existing tag", async () => {
			const id = 12345

			const hiTagAttributes: TagAttributes = {
				name: "hi",
				slug: "hi",
			}

			const tag: Tag = {
				id: id,
				attributes: hiTagAttributes,
				meta: {}
			}

			const strapi = new Strapi({url: strapiUrl})

			const successResponse = {
				data: {},
				meta: {}
			}

			stub(strapi, "update").withArgs('tags', id, hiTagAttributes).resolves(successResponse)

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._updateTag(tag)).to.eq(successResponse)
		})
	})
})
