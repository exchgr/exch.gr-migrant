import Strapi, {
	StrapiError,
	StrapiRequestParams,
	StrapiResponse
} from "strapi-sdk-js"
import {match, stub} from "sinon"
import chai, {expect} from "chai"
import sinonChai from "sinon-chai"
import chaiAsPromised from "chai-as-promised"
import {Article} from "../src/types/Article"
import {StrapiExporter} from "../src/StrapiExporter"
import {Tag} from "../src/types/Tag"
import {DataContainer} from "../src/types/DataContainer"
import {Collection} from "../src/types/Collection"
import {Connection} from "../src/types/Connection"
import {Redirect} from "../src/types/Redirect"
import {Entity} from "../src/types/Entity"
import {Table} from "../src/types/Table"
import {Attributes} from "../src/types/Attributes"

chai.use(sinonChai)
chai.use(chaiAsPromised)

type FindOrInitEntityByPropertyExtantTestDatum<T extends Attributes> = {
	titleEntityName: string,
	id: 12345,
	propertyName: keyof T
	propertyValue: string
	entityAttributes: T
	table: Table
}

type FindOrInitEntityByPropertyNewTestDatum<T extends Attributes> = {
	titleEntityName: string,
	propertyName: keyof T
	propertyValue: string
	entityAttributes: T
	table: Table
}

type FindOrInitEntityByPropertyErrorTestDatum<T extends Attributes> = {
	propertyName: keyof T
	propertyValue: string
	entityAttributes: T
	table: Table
}

type CreateEntityTestDatum<T extends Attributes> = {
	titleEntityName: string
	entityAttributes: T
	table: Table
}

type UpdateEntityTestDatum<T extends Attributes> = {
	titleEntityName: string
	entityAttributes: T
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

			const extantArticle: Article = {
				title: "hi",
				body: "<article>hi</article>",
				slug: extantArticleSlug,
				author: "me",
				og_type: "poast",
				createdAt: new Date(),
				updatedAt: new Date(),
				publishedAt: new Date()
			}

			const newArticle: Article = {
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

			const extantTag: Tag = {
				name: "Greetings",
				slug: extantTagSlug
			}

			const extantTagEntity: Entity<Tag> = {
				id: 1,
				attributes: extantTag,
				meta: {}
			}

			const extantTagEntityWithArticleIds: Entity<Tag> = {
				...extantTagEntity,
				attributes: {
					articles: [extantArticleId, newArticleId],
					...extantTag
				},
			}

			const newTagSlug = "casual-greetings"

			const newTag: Tag = {
				name: "Casual greetings",
				slug: newTagSlug
			}

			const newTagEntity: Entity<Tag> = {
				attributes: newTag,
				meta: {}
			}

			const newTagEntityWithArticleIds: Entity<Tag> = {
				...newTagEntity,
				attributes: {
					articles: [newArticleId],
					...newTag
				},
			}

			const createdNewTagEntityWithArticleIds: Entity<Tag> = {
				id: 2,
				...newTagEntityWithArticleIds
			}

			const tagArticles: Connection = {
				[extantTagSlug]: [extantArticleSlug, newArticleSlug],
				[newTagSlug]: [newTagSlug]
			}

			const newCollectionSlug = "photography"

			const newCollection: Collection = {
				name: "Photography",
				slug: newCollectionSlug
			}

			const newCollectionEntity: Entity<Collection> = {
				attributes: newCollection,
				meta: {}
			}

			const newCollectionEntityWithArticleIds: Entity<Collection> = {
				...newCollectionEntity,
				attributes: {
					...newCollection,
					articles: [extantArticleId]
				}
			}

			const createdNewCollectionEntityWithArticleIds: Entity<Collection> = {
				id: 2,
				...newCollectionEntityWithArticleIds
			}

			const extantCollectionSlug = "code"

			const extantCollection: Collection = {
				name: "Code",
				slug: extantCollectionSlug
			}

			const extantCollectionEntity: Entity<Collection> = {
				id: 1,
				attributes: extantCollection,
				meta: {}
			}

			const extantCollectionEntityWithArticleIds: Entity<Collection> = {
				...extantCollectionEntity,
				attributes: {
					...extantCollection,
					articles: [newArticleId]
				}
			}

			const collectionArticles: Connection = {
				[newCollectionSlug]: [extantArticleSlug],
				[extantCollectionSlug]: [newArticleSlug]
			}

			const newRedirect: Redirect = {
				from: `/fotoblog/${extantArticleSlug}`,
				httpCode: 301
			}

			const newRedirectEntity: Entity<Redirect> = {
				attributes: newRedirect,
				meta: {}
			}

			const newRedirectEntityWithArticleId: Entity<Redirect> = {
				...newRedirectEntity,
				attributes: {
					...newRedirect,
					to: extantArticleId
				}
			}

			const createdNewRedirectEntityWithArticleId: Entity<Redirect> = {
				id: 2,
				...newRedirectEntityWithArticleId,
			}

			const extantRedirect: Redirect = {
				from: `/fotoblog/${newArticleSlug}`,
				httpCode: 301
			}

			const extantRedirectEntity: Entity<Redirect> = {
				id: 1,
				attributes: extantRedirect,
				meta: {}
			}

			const extantRedirectEntityWithArticleId: Entity<Redirect> = {
				...extantRedirectEntity,
				attributes: {
					...extantRedirect,
					to: newArticleId
				}
			}

			const dataContainer: DataContainer = {
				articleAttributesCollection: [
					extantArticle,
					newArticle
				],
				tagAttributesCollection: [
					extantTag,
					newTag,
				],
				tagArticles,
				collectionAttributesCollection: [
					extantCollection,
					newCollection
				],
				collectionArticles,
				redirectAttributesCollection: [
					newRedirect,
					extantRedirect
				]
			}

			const extantArticleEntity: Entity<Article> = {
				id: extantArticleId,
				attributes: extantArticle,
				meta: {}
			}

			const newArticleEntity: Entity<Article> = {
				attributes: newArticle,
				meta: {}
			}

			const createdNewArticleEntity: Entity<Article> = {
				id: newArticleId,
				attributes: newArticle,
				meta: {}
			}

			const strapi = new Strapi({ url: strapiUrl })

			const strapiExporter = new StrapiExporter(strapi)

			const findOrInitEntityByProperty = async <T extends Attributes>(entityAttributes: T): Promise<Entity<T>> => {
				switch (entityAttributes) {
					case extantArticle: {
						return extantArticleEntity as Entity<T>
					}
					case newArticle: {
						return newArticleEntity as Entity<T>
					}
					case extantTag: {
						return extantTagEntity as Entity<T>
					}
					case newTag: {
						return newTagEntity as Entity<T>
					}
					case newCollection: {
						return newCollectionEntity as Entity<T>
					}
					case extantCollection: {
						return extantCollectionEntity as Entity<T>
					}
					case newRedirect: {
						return newRedirectEntity as Entity<T>
					}
					case extantRedirect: {
						return extantRedirectEntity as Entity<T>
					}
					default: {
						return {} as Entity<T>
					}
				}
			}

			stub(strapiExporter, "_findOrInitEntityByProperty")
				.withArgs('articles', match('slug')).returns(findOrInitEntityByProperty)
				.withArgs('tags', match('slug')).returns(findOrInitEntityByProperty)
				.withArgs('collections', match('slug')).returns(findOrInitEntityByProperty)
				.withArgs('redirects', match('from')).returns(findOrInitEntityByProperty)

			stub(strapiExporter, "_exists")
				.withArgs(extantArticleEntity).returns(true)
				.withArgs(newArticleEntity).returns(false)
				.withArgs(extantTagEntityWithArticleIds).returns(true)
				.withArgs(newTagEntityWithArticleIds).returns(false)
				.withArgs(extantCollectionEntityWithArticleIds).returns(true)
				.withArgs(newCollectionEntityWithArticleIds).returns(false)
				.withArgs(extantRedirectEntity).returns(true)
				.withArgs(newRedirectEntity).returns(false)

			const updateEntity = async <T extends Attributes>(entity: Entity<T>): Promise<Entity<T>> => {
				switch(entity) {
					case extantArticleEntity: {
						return extantArticleEntity as Entity<T>
					}
					case extantTagEntityWithArticleIds: {
						return extantTagEntityWithArticleIds as Entity<T>
					}
					case extantCollectionEntityWithArticleIds: {
						return extantCollectionEntityWithArticleIds as Entity<T>
					}
					case extantRedirectEntity: {
						return extantRedirectEntityWithArticleId as Entity<T>
					}
					default: {
						return {} as Entity<T>
					}
				}
			}

			stub(strapiExporter, "_updateEntity")
				.withArgs('articles').returns(updateEntity)
				.withArgs('tags').returns(updateEntity)
				.withArgs('collections').returns(updateEntity)
				.withArgs('redirects').returns(updateEntity)

			const createEntity = async <T extends Attributes>(entity: Entity<T>): Promise<Entity<T>> => {
				switch (entity) {
					case newArticleEntity: {
						return createdNewArticleEntity as Entity<T>
					}
					case newTagEntityWithArticleIds: {
						return createdNewTagEntityWithArticleIds as Entity<T>
					}
					case newCollectionEntityWithArticleIds: {
						return createdNewCollectionEntityWithArticleIds as Entity<T>
					}
					case newRedirectEntity: {
						return createdNewRedirectEntityWithArticleId as Entity<T>
					}
					default: {
						return {} as Entity<T>
					}
				}
			}

			stub(strapiExporter, "_createEntity")
				.withArgs('articles').returns(createEntity)
				.withArgs('tags').returns(createEntity)
				.withArgs('collections').returns(createEntity)
				.withArgs('redirects').returns(createEntity)


			stub(strapiExporter, "_connectEntities")
				.withArgs(
					match(collectionArticles),
					match.array.deepEquals([createdNewArticleEntity, extantArticleEntity]),
					[extantCollectionEntity, newCollectionEntity]
				).returns([extantCollectionEntityWithArticleIds, newCollectionEntityWithArticleIds])
				.withArgs(
					match(tagArticles),
					match.array.deepEquals([createdNewArticleEntity, extantArticleEntity]),
					[extantTagEntity, newTagEntity]
				).returns([extantTagEntityWithArticleIds, newTagEntityWithArticleIds])

			expect(await strapiExporter.export(dataContainer)).to.deep.eq([
				createdNewArticleEntity,
				extantArticleEntity,
				createdNewTagEntityWithArticleIds,
				extantTagEntityWithArticleIds,
				createdNewCollectionEntityWithArticleIds,
				extantCollectionEntityWithArticleIds,
				createdNewRedirectEntityWithArticleId,
				extantRedirectEntityWithArticleId
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

		findOrInitEntityByPropertyExtantTestData.forEach(<T extends Attributes>(testDatum: FindOrInitEntityByPropertyExtantTestDatum<T>) => {
			it(`should return an existing ${testDatum.titleEntityName}, updated with incoming ${testDatum.titleEntityName}Attributes data`, async () => {
				const queryParams: StrapiRequestParams = {
					filters: {
						[testDatum.propertyName]: {
							$eq: testDatum.propertyValue
						}
					}
				}

				const entity: Entity<T> = {
					id: testDatum.id,
					attributes: testDatum.entityAttributes,
					meta: {}
				} as Entity<T>

				const strapi = new Strapi({ url: strapiUrl })

				stub(strapi, "find").withArgs(testDatum.table, queryParams).resolves({
					data: [{
						id: testDatum.id,
						attributes: {
							[testDatum.propertyName]: testDatum.propertyValue
						} as unknown as T,
						meta: {}
					}],
					meta: {}
				} as StrapiResponse<Entity<T>[]>)

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

		findOrInitEntityByPropertyNewTestData.forEach(<T extends Attributes>(testDatum: FindOrInitEntityByPropertyNewTestDatum<T>) => {
			it(`should return a new ${testDatum.titleEntityName} if one doesn't exist`, async () => {
				const queryParams: StrapiRequestParams = {
					filters: {
						[testDatum.propertyName]: {
							$eq: testDatum.propertyValue
						}
					}
				}

				const entity: Entity<T> = {
					id: undefined,
					attributes: testDatum.entityAttributes,
					meta: {}
				} as Entity<T>

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

		findOrInitEntityByPropertyErrorTestData.forEach(<T extends Attributes>(testDatum: FindOrInitEntityByPropertyErrorTestDatum<T>) => {
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
		const createEntityTestData: CreateEntityTestDatum<any>[] = [
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

		createEntityTestData.forEach(<T extends Attributes>(testDatum: CreateEntityTestDatum<T>) => {
			it(`should create a new ${testDatum.titleEntityName}`, async () => {
				const newEntity: Entity<T> = {
					id: undefined,
					attributes: testDatum.entityAttributes,
					meta: {}
				}

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

	describe("_updateEntity", () => {
		const updateEntityTestData: UpdateEntityTestDatum<any>[] = [
			{
				titleEntityName: "article",
				entityAttributes: {
					title: "hi",
					body: "<article>hi</article>",
					slug: "hi",
					author: "me",
					og_type: "poast",
					createdAt: new Date(),
					updatedAt: new Date(),
					publishedAt: new Date()
				} as Article,
				table: 'articles'
			},
			{
				titleEntityName: 'tag',
				entityAttributes: {
					name: "hi",
					slug: "hi",
				} as Tag,
				table: "tags"
			},
			{
				titleEntityName: 'collection',
				entityAttributes: {
					name: "Code",
					slug: "code",
				} as Collection,
				table: 'collections'
			},
			{
				titleEntityName: 'redirect',
				entityAttributes: {
					from: "/fotoblog/hi",
					httpCode: 301
				} as Redirect,
				table: 'redirects'
			}
		]

		updateEntityTestData.forEach(<T extends Attributes>(testDatum: UpdateEntityTestDatum<T>) => {
			it(`should update an existing ${testDatum.titleEntityName}`, async () => {
				const id = 12345

				const entity: Entity<T> = {
					id: id,
					attributes: testDatum.entityAttributes,
					meta: {}
				} as Entity<T>

				const strapi = new Strapi({url: strapiUrl})

				stub(strapi, "update").withArgs(testDatum.table, id, testDatum.entityAttributes).resolves({
					data: entity,
					meta: {}
				})

				const strapiExporter = new StrapiExporter(strapi)

				expect(await strapiExporter._updateEntity(testDatum.table)(entity)).to.eq(entity)
			})
		})
	})

	describe("_exists", () => {
		it("should return true if article has an id", () => {
			const article: Entity<Article> = {
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
			const article: Entity<Article> = {
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

	describe("_connectEntities", () => {
		it("should connect two entities by putting A's IDs into B's As field", () => {
			const tagSlug = "tag"
			const articleSlug = "article"
			const articleId = 1

			const tagArticles: Connection = {
				[tagSlug]: [articleSlug]
			}

			const now = new Date()

			const articles: Entity<Article>[] = [
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

			const tagAttributes: Tag = {
				name: "Tag",
				slug: tagSlug
			}

			const tag: Entity<Tag> = {
				attributes: tagAttributes,
				meta: {}
			}

			const tags: Entity<Tag>[] = [tag]

			const tagsWithArticleIds: Entity<Tag>[] = [
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

			expect(strapiExporter._connectEntities(tagArticles, articles, tags, "articles", "slug", "slug")).to.deep.eq(tagsWithArticleIds)
		})
	})

	describe("_connectArticlesToCollections", () => {
		it("should connect created articles to collections by putting articles' IDs into collections' articles field", () => {
			const collectionSlug = "tag"
			const articleSlug = "article"
			const articleId = 1

			const collectionArticles: Connection = {
				[collectionSlug]: [articleSlug]
			}


			const now = new Date()

			const articles: Entity<Article>[] = [
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

			const collectionAttributes: Collection = {
				name: "Tag",
				slug: collectionSlug
			}

			const collection: Entity<Collection> = {
				attributes: collectionAttributes,
				meta: {}
			}

			const collections: Entity<Collection>[] = [collection]

			const collectionsWithArticleIds: Entity<Collection>[] = [
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

			expect(strapiExporter._connectEntities(
				collectionArticles, articles, collections, "articles", "slug", "slug"
			)).to.deep.eq(collectionsWithArticleIds)
		})
	})
})
