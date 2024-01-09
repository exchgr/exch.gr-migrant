import Strapi, {
	StrapiError,
	StrapiRequestParams,
	StrapiResponse
} from "strapi-sdk-js"
import {match, stub} from "sinon"
import chai, {expect} from "chai"
import sinonChai from "sinon-chai"
import chaiAsPromised from "chai-as-promised"
import {ArticleAttributes} from "../src/types/ArticleAttributes"
import {StrapiExporter} from "../src/StrapiExporter"
import {Article} from "../src/types/Article"
import {TagAttributes} from "../src/types/TagAttributes"
import {Tag} from "../src/types/Tag"
import {DataContainer} from "../src/types/DataContainer"
import {CollectionAttributes} from "../src/types/CollectionAttributes"
import {Collection} from "../src/types/Collection"
import {CollectionArticles} from "../src/types/CollectionArticles"
import {TagArticles} from "../src/types/TagArticles"

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe("StrapiExporter", () => {
	const strapiUrl = "http://localhost:1337"

	describe("export", () => {
		it("should update extant articles and create new ones", async () => {
			const extantArticleSlug = "hi"
			const newArticleSlug = "hey"

			const extantArticleId = 12345
			const newArticleId = 12346

			const extantArticleAttributes: ArticleAttributes = {
				title: "hi",
				body: "<article>hi</article>",
				slug: extantArticleSlug,
				author: "me",
				og_type: "poast",
				createdAt: new Date(),
				updatedAt: new Date(),
				publishedAt: new Date()
			}

			const newArticleAttributes: ArticleAttributes = {
				title: "hey",
				body: "<article>hey</article>",
				slug: newArticleSlug,
				author: "me",
				og_type: "poast",
				createdAt: new Date(),
				updatedAt: new Date(),
				publishedAt: new Date()
			}

			const extantTagSlug = "greetings"

			const extantTagAttributes: TagAttributes = {
				name: "Greetings",
				slug: extantTagSlug
			}

			const extantTag: Tag = {
				id: 1,
				attributes: extantTagAttributes,
				meta: {}
			}

			const extantTagWithArticleIds: Tag = {
				...extantTag,
				attributes: {
					articles: [extantArticleId, newArticleId],
					...extantTagAttributes
				},
			}

			const newTagSlug = "casual-greetings"

			const newTagAttributes: TagAttributes = {
				name: "Casual greetings",
				slug: newTagSlug
			}

			const newTag: Tag = {
				attributes: newTagAttributes,
				meta: {}
			}

			const newTagWithArticleIds: Tag = {
				...newTag,
				attributes: {
					articles: [newArticleId],
					...newTagAttributes
				},
			}

			const createdNewTagWithArticleIds: Tag = {
				id: 2,
				...newTagWithArticleIds
			}

			const tagArticles: TagArticles = {
				[extantTagSlug]: [extantArticleSlug, newArticleSlug],
				[newTagSlug]: [newTagSlug]
			}

			const newCollectionSlug = "photography"

			const newCollectionAttributes: CollectionAttributes = {
				name: "Photography",
				slug: newCollectionSlug
			}

			const newCollection: Collection = {
				attributes: newCollectionAttributes,
				meta: {}
			}

			const newCollectionWithArticleIds: Collection = {
				...newCollection,
				attributes: {
					...newCollectionAttributes,
					articles: [extantArticleId]
				}
			}

			const createdNewCollectionWithArticleIds: Collection = {
				id: 2,
				...newCollectionWithArticleIds
			}

			const extantCollectionSlug = "code"

			const extantCollectionAttributes: CollectionAttributes = {
				name: "Code",
				slug: extantCollectionSlug
			}

			const extantCollection: Collection = {
				id: 1,
				attributes: extantCollectionAttributes,
				meta: {}
			}

			const extantCollectionWithArticleIds: Collection = {
				...extantCollection,
				attributes: {
					...extantCollectionAttributes,
					articles: [newArticleId]
				}
			}

			const collectionArticles: CollectionArticles = {
				[newCollectionSlug]: [extantArticleSlug],
				[extantCollectionSlug]: [newArticleSlug]
			}

			const dataContainer: DataContainer = {
				articleAttributesCollection: [
					extantArticleAttributes,
					newArticleAttributes
				],
				tagAttributesCollection: [
					extantTagAttributes,
					newTagAttributes,
				],
				tagArticles,
				collectionAttributesCollection: [
					extantCollectionAttributes,
					newCollectionAttributes
				],
				collectionArticles
			}

			const extantArticle: Article = {
				id: extantArticleId,
				attributes: extantArticleAttributes,
				meta: {}
			}

			const newArticle: Article = {
				attributes: newArticleAttributes,
				meta: {}
			}

			const createdNewArticle: Article = {
				id: newArticleId,
				attributes: newArticleAttributes,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			const strapiExporter = new StrapiExporter(strapi)

			stub(strapiExporter, "_findOrInitArticle")
				.withArgs(extantArticleAttributes).resolves(extantArticle)
				.withArgs(newArticleAttributes).resolves(newArticle)

			stub(strapiExporter, "_exists")
				.withArgs(extantArticle).returns(true)
				.withArgs(newArticle).returns(false)
				.withArgs(extantTagWithArticleIds).returns(true)
				.withArgs(newTagWithArticleIds).returns(false)
				.withArgs(extantCollectionWithArticleIds).returns(true)
				.withArgs(newCollectionWithArticleIds).returns(false)

			stub(strapiExporter, "_updateArticle").withArgs(extantArticle).resolves(extantArticle)

			stub(strapiExporter, "_createArticle").withArgs(newArticle).resolves(createdNewArticle)

			stub(strapiExporter, "_connectArticlesToTags").withArgs(
				tagArticles,
				match.array.deepEquals([createdNewArticle, extantArticle]),
				[extantTag, newTag]
			).returns([extantTagWithArticleIds, newTagWithArticleIds])

			stub(strapiExporter, "_findOrInitTag")
				.withArgs(extantTagAttributes).resolves(extantTag)
				.withArgs(newTagAttributes).resolves(newTag)

			stub(strapiExporter, "_createTag").withArgs(newTagWithArticleIds).resolves(createdNewTagWithArticleIds)

			stub(strapiExporter, "_updateTag").withArgs(extantTagWithArticleIds).resolves(extantTagWithArticleIds)

			stub(strapiExporter, "_findOrInitCollection")
				.withArgs(newCollectionAttributes).resolves(newCollection)
				.withArgs(extantCollectionAttributes).resolves(extantCollection)

			stub(strapiExporter, "_createCollection").withArgs(newCollectionWithArticleIds).resolves(createdNewCollectionWithArticleIds)

			stub(strapiExporter, "_updateCollection").withArgs(extantCollectionWithArticleIds).resolves(extantCollectionWithArticleIds)

			stub(strapiExporter, "_connectArticlesToCollections").withArgs(
				collectionArticles,
				match.array.deepEquals([createdNewArticle, extantArticle]),
				[extantCollection, newCollection]
			).returns([extantCollectionWithArticleIds, newCollectionWithArticleIds])

			expect(await strapiExporter.export(dataContainer)).to.deep.eq([
				createdNewArticle,
				extantArticle,
				createdNewTagWithArticleIds,
				extantTagWithArticleIds,
				createdNewCollectionWithArticleIds,
				extantCollectionWithArticleIds
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
				og_type: "poast",
				createdAt: new Date(),
				updatedAt: new Date(),
				publishedAt: new Date()
			}

			const newArticle: Article = {
				id: undefined,
				attributes: heyArticleAttributes,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			const createdArticle = {
				id: 1,
				...newArticle
			}

			stub(strapi, "create").withArgs('articles', heyArticleAttributes).resolves({
				data: createdArticle,
				meta: {}
			})

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._createArticle(newArticle)).to.eq(createdArticle)
		})
	})

	describe("_updateArticle", () => {
		it("should update an existing article", async () => {
			const id = 12345

			const hiArticleAttributes: ArticleAttributes = {
				title: "hi",
				body: "<article>hi</article>",
				slug: "hi",
				author: "me",
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
				data: article,
				meta: {}
			})

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._updateArticle(article)).to.eq(article)
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

	describe("_connectArticlesToTags", () => {
		it("should connect created articles to tags by putting articles' IDs into tags' articles field", () => {
			const tagSlug = "tag"
			const articleSlug = "article"
			const articleId = 1

			const tagArticles: TagArticles = {
				[tagSlug]: [articleSlug]
			}

			const now = new Date()

			const articles: Article[] = [
				{
					id: articleId,
					attributes: {
						title: "title",
						slug: articleSlug,
						body: "body",
						author: "elle mundy",
						og_type: "post",
						createdAt: now,
						updatedAt: now,
						publishedAt: now
					},
					meta: {}
				}
			]

			const tagAttributes = {
				name: "Tag",
				slug: tagSlug
			}

			const tag = {
				attributes: tagAttributes,
				meta: {}
			}

			const tags: Tag[] = [tag]

			const tagsWithArticleIds: Tag[] = [
				{
					...tag,
					attributes: {
						...tagAttributes,
						articles: [articleId]
					}
				}
			]

			const strapi = new Strapi({ url: strapiUrl })

			const strapiExporter = new StrapiExporter(strapi)

			expect(strapiExporter._connectArticlesToTags(tagArticles, articles, tags)).to.deep.eq(tagsWithArticleIds)
		})
	})

	describe("_createTag", () => {
		it("should create a new tag", async () => {
			const heyTagAttributes: TagAttributes = {
				name: "hey",
				slug: "hey",
			}

			const heyTag: Tag = {
				attributes: heyTagAttributes,
				meta: {}
			}

			const createdHeyTag = {
				id: 1,
				...heyTag
			}

			const strapi = new Strapi({ url: strapiUrl })

			stub(strapi, "create").withArgs('tags', heyTagAttributes).resolves({
				data: createdHeyTag,
				meta: {}
			})

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._createTag(heyTag)).to.eq(createdHeyTag)
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

			stub(strapi, "update").withArgs('tags', id, hiTagAttributes).resolves({
				data: tag,
				meta: {}
			})

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._updateTag(tag)).to.eq(tag)
		})
	})

	describe("_findOrInitCollection", () => {
		it("should return an existing collection, updated with incoming CollectionAttributes data", async () => {
			const id = 12345

			const extantCollectionSlug = "code"

			const extantCollectionAttributes: CollectionAttributes = {
				name: "Code",
				slug: extantCollectionSlug
			}

			const extantCollectionQueryParams: StrapiRequestParams = {
				filters: {
					slug: {
						$eq: extantCollectionSlug
					}
				}
			}

			const extantCollection: Collection = {
				id: id,
				attributes: extantCollectionAttributes,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			stub(strapi, "find").withArgs('collections', extantCollectionQueryParams).resolves({
				data: [{
					id: id,
					attributes: {
						slug: extantCollectionSlug
					},
					meta: {}
				}],
				meta: {}
			} as StrapiResponse<Collection[]>)

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._findOrInitCollection(extantCollectionAttributes)).to.deep.eq(extantCollection)
		})

		it("should return a new collection if one doesn't exist", async () => {
			const newCollectionSlug = "hey"

			const newCollectionAttributes: CollectionAttributes = {
				name: "hey",
				slug: newCollectionSlug
			}

			const newCollectionQueryParams: StrapiRequestParams = {
				filters: {
					slug: {
						$eq: newCollectionSlug
					}
				}
			}

			const newCollection: Collection = {
				attributes: newCollectionAttributes,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			stub(strapi, "find").withArgs('collections', newCollectionQueryParams).rejects({
				data: null,
				error: {
					status: 404,
					name: "NotFoundError",
					message: "Not Found",
					details: {},
				},
			} as StrapiError)

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._findOrInitCollection(newCollectionAttributes)).to.deep.eq(newCollection)
		})

		it("should rethrow all other errors", async () => {
			const collectionSlug = "hey"

			const collectionAttributes: CollectionAttributes = {
				name: "hey",
				slug: collectionSlug,
			}

			const heyQueryParams: StrapiRequestParams = {
				filters: {
					slug: {
						$eq: collectionSlug
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

			stub(strapi, "find").withArgs('collections', heyQueryParams).rejects({
				data: null,
				error: error,
			} as StrapiError)

			const strapiExporter = new StrapiExporter(strapi)

			expect(strapiExporter._findOrInitTag(collectionAttributes)).to.be.rejectedWith(error)
		})
	})

	describe("_createCollection", () => {
		it("should create a new collection", async () => {
			const newCollectionAttributes: CollectionAttributes = {
				name: "Photography",
				slug: "photography",
			}

			const newCollection: Collection = {
				attributes: newCollectionAttributes,
				meta: {}
			}

			const createdCollection = {
				id: 1,
				...newCollection
			}

			const strapi = new Strapi({ url: strapiUrl })

			stub(strapi, "create").withArgs('collections', newCollectionAttributes).resolves({
				data: createdCollection,
				meta: {}
			})

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._createCollection(newCollection)).to.eq(createdCollection)
		})
	})

	describe("_updateCollection", () => {
		it("should update an existing collection", async () => {
			const id = 12345

			const extantCollectionAttributes: CollectionAttributes = {
				name: "Code",
				slug: "code",
			}

			const collection: Collection = {
				id: id,
				attributes: extantCollectionAttributes,
				meta: {}
			}

			const strapi = new Strapi({url: strapiUrl})

			stub(strapi, "update").withArgs('collections', id, extantCollectionAttributes).resolves({
				data: collection,
				meta: {}
			})

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._updateCollection(collection)).to.eq(collection)
		})
	})

	describe("_connectArticlesToCollections", () => {
		it("should connect created articles to collections by putting articles' IDs into collections' articles field", () => {
			const collectionSlug = "tag"
			const articleSlug = "article"
			const articleId = 1

			const collectionArticles: CollectionArticles = {
				[collectionSlug]: [articleSlug]
			}


			const now = new Date()

			const articles: Article[] = [
				{
					id: articleId,
					attributes: {
						title: "title",
						slug: articleSlug,
						body: "body",
						author: "elle mundy",
						og_type: "post",
						createdAt: now,
						updatedAt: now,
						publishedAt: now
					},
					meta: {}
				}
			]

			const collectionAttributes: CollectionAttributes = {
				name: "Tag",
				slug: collectionSlug
			}

			const collection: Collection = {
				attributes: collectionAttributes,
				meta: {}
			}

			const collections: Collection[] = [collection]

			const collectionsWithArticleIds: Collection[] = [
				{
					...collection,
					attributes: {
						...collectionAttributes,
						articles: [articleId]
					}
				}
			]

			const strapi = new Strapi({ url: strapiUrl })

			const strapiExporter = new StrapiExporter(strapi)

			expect(strapiExporter._connectArticlesToCollections(
				collectionArticles, articles, collections
			)).to.deep.eq(collectionsWithArticleIds)
		})
	})
})
