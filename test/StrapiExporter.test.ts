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
import {RedirectAttributes} from "../src/types/RedirectAttributes"
import {Redirect} from "../src/types/Redirect"
import {Entity} from "../src/types/Entity"
import {Table} from "../src/types/Table"

chai.use(sinonChai)
chai.use(chaiAsPromised)

type FindOrInitEntityByPropertyExtantTestDatum<T extends Entity> = {
	titleEntityName: string,
	id: 12345,
	propertyName: keyof T["attributes"]
	propertyValue: string
	entityAttributes: T["attributes"]
	table: Table
}

type FindOrInitEntityByPropertyNewTestDatum<T extends Entity> = {
	titleEntityName: string,
	propertyName: keyof T["attributes"]
	propertyValue: string
	entityAttributes: T["attributes"]
	table: Table
}

type FindOrInitEntityByPropertyErrorTestDatum<T extends Entity> = {
	propertyName: keyof T["attributes"]
	propertyValue: string
	entityAttributes: T["attributes"]
	table: Table
}

type CreateEntityTestDatum<T extends Entity> = {
	titleEntityName: string
	entityAttributes: T["attributes"]
	table: Table
}

describe("StrapiExporter", () => {
	const strapiUrl = "http://localhost:1337"

	describe("export", () => {
		it("should update extant articles and create new ones", async () => {
			const extantArticleSlug = "extant-article"
			const newArticleSlug = "new-article"

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

			const newRedirectAttributes: RedirectAttributes = {
				from: `/fotoblog/${extantArticleSlug}`,
				httpCode: 301
			}

			const newRedirect: Redirect = {
				attributes: newRedirectAttributes,
				meta: {}
			}

			const newRedirectWithArticleId: Redirect = {
				...newRedirect,
				attributes: {
					...newRedirectAttributes,
					to: extantArticleId
				}
			}

			const createdNewRedirectWithArticleId: Redirect = {
				id: 2,
				...newRedirectWithArticleId,
			}

			const extantRedirectAttributes: RedirectAttributes = {
				from: `/fotoblog/${newArticleSlug}`,
				httpCode: 301
			}

			const extantRedirect: Redirect = {
				id: 1,
				attributes: extantRedirectAttributes,
				meta: {}
			}

			const extantRedirectWithArticleId: Redirect = {
				...extantRedirect,
				attributes: {
					...extantRedirectAttributes,
					to: newArticleId
				}
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
				collectionArticles,
				redirectAttributesCollection: [
					newRedirectAttributes,
					extantRedirectAttributes
				]
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

			const findOrInitEntity: <T extends Entity>(entityAttributes: T["attributes"]) => Promise<T> = async <T extends Entity>(entityAttributes: T["attributes"]): Promise<T> => {
				switch (entityAttributes) {
					case extantArticleAttributes: {
						return extantArticle as T
					}
					case newArticleAttributes: {
						return newArticle as T
					}
					case extantTagAttributes: {
						return extantTag as T
					}
					case newTagAttributes: {
						return newTag as T
					}
					case newCollectionAttributes: {
						return newCollection as T
					}
					case extantCollectionAttributes: {
						return extantCollection as T
					}
					case newRedirectAttributes: {
						return newRedirect as T
					}
					case extantRedirectAttributes: {
						return extantRedirect as T
					}
					default: {
						return {} as T
					}
				}
			}

			stub(strapiExporter, "_findOrInitEntityByProperty")
				.withArgs('articles', match('slug')).returns(findOrInitEntity)
				.withArgs('tags', match('slug')).returns(findOrInitEntity)
				.withArgs('collections', match('slug')).returns(findOrInitEntity)
				.withArgs('redirects', match('from')).returns(findOrInitEntity)

			stub(strapiExporter, "_exists")
				.withArgs(extantArticle).returns(true)
				.withArgs(newArticle).returns(false)
				.withArgs(extantTagWithArticleIds).returns(true)
				.withArgs(newTagWithArticleIds).returns(false)
				.withArgs(extantCollectionWithArticleIds).returns(true)
				.withArgs(newCollectionWithArticleIds).returns(false)
				.withArgs(extantRedirect).returns(true)
				.withArgs(newRedirect).returns(false)

			stub(strapiExporter, "_updateArticle").withArgs(extantArticle).resolves(extantArticle)

			const createEntity = async <T extends Entity>(entity: T): Promise<T> => {
				switch (entity) {
					case newArticle: {
						return createdNewArticle as T
					}
					case newTagWithArticleIds: {
						return createdNewTagWithArticleIds as T
					}
					case newCollectionWithArticleIds: {
						return createdNewCollectionWithArticleIds as T
					}
					case newRedirect: {
						return createdNewRedirectWithArticleId as T
					}
					default: {
						return {} as T
					}
				}
			}

			stub(strapiExporter, "_createEntity")
				.withArgs('articles').returns(createEntity)
				.withArgs('tags').returns(createEntity)
				.withArgs('collections').returns(createEntity)
				.withArgs('redirects').returns(createEntity)

			stub(strapiExporter, "_connectArticlesToTags").withArgs(
				tagArticles,
				match.array.deepEquals([createdNewArticle, extantArticle]),
				[extantTag, newTag]
			).returns([extantTagWithArticleIds, newTagWithArticleIds])

			stub(strapiExporter, "_updateTag").withArgs(extantTagWithArticleIds).resolves(extantTagWithArticleIds)

			stub(strapiExporter, "_updateCollection").withArgs(extantCollectionWithArticleIds).resolves(extantCollectionWithArticleIds)

			stub(strapiExporter, "_connectArticlesToCollections").withArgs(
				collectionArticles,
				match.array.deepEquals([createdNewArticle, extantArticle]),
				[extantCollection, newCollection]
			).returns([extantCollectionWithArticleIds, newCollectionWithArticleIds])

			stub(strapiExporter, "_updateRedirect")
				.withArgs(extantRedirect).resolves(extantRedirectWithArticleId)

			expect(await strapiExporter.export(dataContainer)).to.deep.eq([
				createdNewArticle,
				extantArticle,
				createdNewTagWithArticleIds,
				extantTagWithArticleIds,
				createdNewCollectionWithArticleIds,
				extantCollectionWithArticleIds,
				createdNewRedirectWithArticleId,
				extantRedirectWithArticleId
			])
		})
	})

	describe("_findOrInitEntityByProperty", () => {
		const date = new Date()

		const findOrInitEntityByPropertyExtantTestData: FindOrInitEntityByPropertyExtantTestDatum<any>[] = [
			{
				titleEntityName: 'article',
				id: 12345,
				propertyName: "slug",
				propertyValue: "hi",
				entityAttributes: {
					title: "hi",
					body: "<article>hi</article>",
					slug: "hi",
					author: "me",
					og_type: "poast",
					createdAt: date,
					updatedAt: date,
					publishedAt: date
				},
				table: 'articles',
			} as FindOrInitEntityByPropertyExtantTestDatum<Article>,
			{
				titleEntityName: 'tag',
				id: 12345,
				propertyName: "slug",
				propertyValue: "hi",
				entityAttributes: {
					name: "Hi",
					slug: "hi"
				},
				table: 'tags'
			} as FindOrInitEntityByPropertyExtantTestDatum<Tag>,
			{
				titleEntityName: 'collection',
				id: 12345,
				propertyName: "slug",
				propertyValue: "code",
				entityAttributes: {
					name: "Code",
					slug: "code"
				},
				table: 'collections'
			} as FindOrInitEntityByPropertyExtantTestDatum<Collection>,
			{
				titleEntityName: 'redirect',
				id: 12345,
				propertyName: "from",
				propertyValue: "/fotoblog/hi",
				entityAttributes: {
					from: "/fotoblog/hi",
					httpCode: 301
				},
				table: 'redirects'
			} as FindOrInitEntityByPropertyExtantTestDatum<Redirect>
		]

		findOrInitEntityByPropertyExtantTestData.forEach(<T extends Entity>(testDatum: FindOrInitEntityByPropertyExtantTestDatum<T>) => {
			it(`should return an existing ${testDatum.titleEntityName}, updated with incoming ${testDatum.titleEntityName}Attributes data`, async () => {
				const queryParams: StrapiRequestParams = {
					filters: {
						[testDatum.propertyName]: {
							$eq: testDatum.propertyValue
						}
					}
				}

				const entity: T = {
					id: testDatum.id,
					attributes: testDatum.entityAttributes,
					meta: {}
				} as T

				const strapi = new Strapi({ url: strapiUrl })

				stub(strapi, "find").withArgs(testDatum.table, queryParams).resolves({
					data: [{
						id: testDatum.id,
						attributes: {
							[testDatum.propertyName]: testDatum.propertyValue
						} as unknown as T["attributes"],
						meta: {}
					}],
					meta: {}
				} as StrapiResponse<T[]>)

				const strapiExporter = new StrapiExporter(strapi)

				expect(await strapiExporter._findOrInitEntityByProperty<T>(testDatum.table, testDatum.propertyName)(testDatum.entityAttributes)).to.deep.eq(entity)
			})
		})

		const findOrInitEntityByPropertyNewTestData: FindOrInitEntityByPropertyNewTestDatum<any>[] = [
			{
				titleEntityName: "article",
				propertyName: "slug",
				propertyValue: "hey",
				entityAttributes: {
					title: "hey",
					body: "<article>hey</article>",
					slug: "hey",
					author: "me",
					og_type: "poast",
					createdAt: date,
					updatedAt: date,
					publishedAt: date
				},
				table: "articles"
			} as FindOrInitEntityByPropertyNewTestDatum<Article>,
			{
				titleEntityName: "tag",
				propertyName: "slug",
				propertyValue: "hey",
				entityAttributes: {
					name: "hey",
					slug: "hey"
				},
				table: "tags"
			} as FindOrInitEntityByPropertyNewTestDatum<Tag>,
			{
				titleEntityName: "collection",
				propertyName: "slug",
				propertyValue: "hey",
				entityAttributes: {
					name: "hey",
					slug: "hey"
				},
				table: "collections"
			} as FindOrInitEntityByPropertyNewTestDatum<Collection>,
			{
				titleEntityName: "redirect",
				propertyName: "from",
				propertyValue: "/fotoblog/hey",
				entityAttributes: {
					from: "/fotoblog/hey",
					httpCode: 301
				},
				table: "redirects"
			} as FindOrInitEntityByPropertyNewTestDatum<Redirect>
		]

		findOrInitEntityByPropertyNewTestData.forEach(<T extends Entity>(testDatum: FindOrInitEntityByPropertyNewTestDatum<T>) => {
			it(`should return a new ${testDatum.titleEntityName} if one doesn't exist`, async () => {
				const queryParams: StrapiRequestParams = {
					filters: {
						[testDatum.propertyName]: {
							$eq: testDatum.propertyValue
						}
					}
				}

				const entity: T = {
					id: undefined,
					attributes: testDatum.entityAttributes,
					meta: {}
				} as T

				const strapi = new Strapi({ url: strapiUrl })

				stub(strapi, "find").withArgs(testDatum.table, queryParams).rejects({
					data: null,
					error: {
						status: 404,
						name: "NotFoundError",
						message: "Not Found",
						details: {},
					},
				} as StrapiError)

				const strapiExporter = new StrapiExporter(strapi)

				expect(await strapiExporter._findOrInitEntityByProperty<T>(testDatum.table, testDatum.propertyName)(testDatum.entityAttributes)).to.deep.eq(entity)
			})
		})

		const findOrInitEntityByPropertyErrorTestData: FindOrInitEntityByPropertyErrorTestDatum<any>[] = [
			{
				propertyName: "slug",
				propertyValue: "hey",
				entityAttributes: {
					title: "hey",
					body: "<article>hey</article>",
					slug: "hey",
					author: "me",
					og_type: "poast",
					createdAt: date,
					updatedAt: date,
					publishedAt: date
				},
				table: "articles"
			} as FindOrInitEntityByPropertyErrorTestDatum<Article>,
			{
				propertyName: "slug",
				propertyValue: "hey",
				entityAttributes: {
					name: "hey",
					slug: "hey",
				},
				table: "tags"
			} as FindOrInitEntityByPropertyErrorTestDatum<Tag>,
			{
				propertyName: "slug",
				propertyValue: "hey",
				entityAttributes: {
					name: "hey",
					slug: "hey",
				},
				table: "collections"
			} as FindOrInitEntityByPropertyErrorTestDatum<Collection>,
			{
				propertyName: "from",
				propertyValue: "/fotoblog/hey",
				entityAttributes: {
					from: "/fotoblog/hey",
					httpCode: 301
				},
				table: "redirects"
			} as FindOrInitEntityByPropertyErrorTestDatum<Redirect>
		]

		findOrInitEntityByPropertyErrorTestData.forEach(<T extends Entity>(testDatum: FindOrInitEntityByPropertyErrorTestDatum<T>) => {
			it("should rethrow all other errors", async () => {
				const heyQueryParams: StrapiRequestParams = {
					filters: {
						[testDatum.propertyName]: {
							$eq: testDatum.propertyValue
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

				stub(strapi, "find").withArgs(testDatum.table, heyQueryParams).rejects({
					data: null,
					error: error,
				} as StrapiError)

				const strapiExporter = new StrapiExporter(strapi)

				expect(strapiExporter._findOrInitEntityByProperty<T>(testDatum.table, testDatum.propertyName)(testDatum.entityAttributes)).to.be.rejectedWith(error)
			})
		})
	})

	describe("_createEntity", () => {
		const createEntityTestData: CreateEntityTestDatum<Entity>[] = [
			{
				titleEntityName: 'article',
				entityAttributes: {
					title: "hey",
					body: "<article>hey</article>",
					slug: "hey",
					author: "me",
					og_type: "poast",
					createdAt: new Date(),
					updatedAt: new Date(),
					publishedAt: new Date()
				},
				table: 'articles'
			} as CreateEntityTestDatum<Article>,
			{
				titleEntityName: 'tag',
				entityAttributes: {
					name: "hey",
					slug: "hey",
				},
				table: "tags"
			} as CreateEntityTestDatum<Tag>,
			{
				titleEntityName: 'collection',
				entityAttributes: {
					name: "Photography",
					slug: "photography",
				},
				table: "collections"
			} as CreateEntityTestDatum<Collection>,
			{
				titleEntityName: 'redirect',
				entityAttributes: {
					from: "/fotoblog/hey",
					httpCode: 301
				},
				table: "redirects"
			} as CreateEntityTestDatum<Redirect>
		]

		createEntityTestData.forEach(<T extends Entity>(testDatum: CreateEntityTestDatum<T>) => {
			it(`should create a new ${testDatum.titleEntityName}`, async () => {
				const newEntity: T = {
					id: undefined,
					attributes: testDatum.entityAttributes,
					meta: {}
				} as T

				const strapi = new Strapi({ url: strapiUrl })

				const createdEntity = {
					id: 1,
					...newEntity
				}

				stub(strapi, "create").withArgs(testDatum.table, testDatum.entityAttributes).resolves({
					data: createdEntity,
					meta: {}
				})

				const strapiExporter = new StrapiExporter(strapi)

				expect(await strapiExporter._createEntity(testDatum.table)(newEntity)).to.eq(createdEntity)
			})
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

	describe("_updateRedirect", () => {
		it("should update an existing redirect", async () => {
			const id = 12345

			const extantRedirectAttributes: RedirectAttributes = {
				from: "/fotoblog/hi",
				httpCode: 301
			}

			const redirect: Redirect = {
				id: id,
				attributes: extantRedirectAttributes,
				meta: {}
			}

			const strapi = new Strapi({url: strapiUrl})

			stub(strapi, "update").withArgs('redirects', id, extantRedirectAttributes).resolves({
				data: redirect,
				meta: {}
			})

			const strapiExporter = new StrapiExporter(strapi)

			expect(await strapiExporter._updateRedirect(redirect)).to.eq(redirect)
		})
	})
})
