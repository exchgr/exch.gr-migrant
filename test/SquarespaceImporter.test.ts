import {expect} from "chai"
import SquarespaceImporter from "../src/SquarespaceImporter"
import {JSDOM} from "jsdom"
import {Article} from "../src/types/Article"
import {Tag} from "../src/types/Tag"
import {DataContainer} from "../src/types/DataContainer"
import {DatumContainer} from "../src/types/DatumContainer"
import {Redirect} from "../src/types/Redirect"
import {Connection} from "../src/types/Connection"
import {Collection} from "../src/types/Collection"

describe("SquarespaceImporter", () => {
	const pubDate = new Date("Mon, 02 Jan 2023 01:08:58 +0000");
	const pubDate2 = new Date("Mon, 03 Jan 2023 01:08:58 +0000")

	describe("import", () => {
		it("should import only posts, tags, and postTags (deduplicated) from an XML data string", () => {
			const expectedDataContainer: DataContainer = {
				articleAttributesCollection: [{
					title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
					body: "<article>this is a post</article>",
					createdAt: pubDate,
					publishedAt: pubDate,
					updatedAt: pubDate,
					slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					author: "elle mundy",
					og_type: "article",
				}, {
					title: "Another post",
					body: "<article>Another post</article>",
					createdAt: pubDate2,
					publishedAt: pubDate2,
					updatedAt: pubDate2,
					slug: "another-post-2023-12-22",
					author: "elle mundy",
					og_type: "article",
				}],

				tagAttributesCollection: [
					{
						name: "House of Abundance",
						slug: "house-of-abundance"
					},
					{
						name: "Bed-Stuy",
						slug: "bed-stuy"
					},
					{
						name: "Brooklyn",
						slug: "brooklyn"
					},
					{
						name: "Stoop show",
						slug: "stoop-show"
					},
					{
						name: "Poetry reading",
						slug: "poetry-reading"
					},
					{
						name: "Live music",
						slug: "live-music"
					},
				],

				tagArticles: {
					"house-of-abundance": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"],
					"bed-stuy": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23", "another-post-2023-12-22"],
					"brooklyn": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"],
					"stoop-show": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"],
					"poetry-reading": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"],
					"live-music": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"],
				},

				collectionAttributesCollection: [{
					name: "Photography",
					slug: "photography"
				}],

				collectionArticles: {
					"photography": [
						"rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						"another-post-2023-12-22"
					]
				},

				redirectAttributesCollection: [
					{
						from: "/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						httpCode: 301
					}, {
						from: "/fotoblog/another-post-2023-12-22",
						httpCode: 301
					}
				],

				redirectArticles: {
					"/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23": "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					"/fotoblog/another-post-2023-12-22": "another-post-2023-12-22"
				}
			}

			const squarespaceImporter = new SquarespaceImporter()

			expect(squarespaceImporter.import(squarespaceData)).to.deep.eq(expectedDataContainer)
		});
	})

	describe("_extractItems", () => {
		it("should extract items from xml", () => {
			const squarespaceImporter = new SquarespaceImporter()

			const items = squarespaceImporter._extractItems(squarespaceData);

			const itemsContents = items.map(getItemTextContent)
			const expectedItemsContents = [pageXmlFragment, publishedPostXmlFragment, publishedPost2XmlFragment, draftPostXmlFragment]

			itemsContents.map((itemContent, index) => {
				expect(itemContent).to.eq(expectedItemsContents[index])
			})
		})
	})

	describe("_isPost", () => {
		it("should return true if wp:post_type is post", () => {
			const squarespaceImporter = new SquarespaceImporter()

			const postItem = new JSDOM(
				publishedPostXml,
				{ contentType: "text/xml" }
			).window.document.querySelector("item")!

			expect(squarespaceImporter._isPost(postItem)).to.be.true
		})


		it("should return false if wp:post_type is not post", () => {
			const squarespaceImporter = new SquarespaceImporter()

			const pageItem = new JSDOM(
				pageXml,
				{ contentType: "text/xml" }
			).window.document.querySelector("item")!

			expect(squarespaceImporter._isPost(pageItem)).to.be.false
		})
	})

	describe("_isPublished", () => {
		it("should return true if wp:status is 'publish'", () => {
			const squarespaceImporter = new SquarespaceImporter()

			const publishedItem = new JSDOM(
				publishedPostXml,
				{ contentType: "text/xml" }

			).window.document.querySelector("item")!

			expect(squarespaceImporter._isPublished(publishedItem)).to.be.true
		})

		it("should return false if wp:status is not 'publish'", () => {
			const squarespaceImporter = new SquarespaceImporter()

			const draftItem = new JSDOM(
				draftPostXml,
				{ contentType: "text/xml" }
			).window.document.querySelector("item")!

			expect(squarespaceImporter._isPublished(draftItem)).to.be.false
		})
	})

	describe("_convertToPost", () => {
		it("should convert a Squarespace item to a Post with Tags, excluding Photography", () => {
			const squarespaceImporter = new SquarespaceImporter()

			const item = new JSDOM(
				publishedPostXml,
				{ contentType: "text/xml" }
			).window.document.querySelector("item")!

			const pubDate = new Date("Mon, 02 Jan 2023 01:08:58 +0000");

			const expectedPost: Article = {
				title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
				body: "<article>this is a post</article>",
				createdAt: pubDate,
				publishedAt: pubDate,
				updatedAt: pubDate,
				slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
				author: "elle mundy",
				og_type: "article"
			}

			expect(squarespaceImporter._convertToArticleAttributes(item)).to.deep.eq(expectedPost)
		})
	})

	describe("_extractCategories", () => {
		it("should extract an array of Tags from an xml <item>", () => {
			const squarespaceImporter = new SquarespaceImporter()

			const item = new JSDOM(
				publishedPostXml,
				{
					contentType: "text/xml",
					url: "http://localhost"
				}
			).window.document.querySelector("item")!

			squarespaceImporter._extractCategories(item).forEach((category: Element, index: number) => {
				const expectedCategory: {[key: string]: string} = publishedPostCategoryData[index]

				expect(Array.from(category.childNodes)[0].textContent!).to.eq(expectedCategory.cdata)

				Array.from(category.attributes).forEach((attribute: Attr) => {
					expect(attribute.value).to.eq(expectedCategory[attribute.name])
				})
			})
		})
	})

	describe("_convertToTag", () => {
		it('should convert an xml <category domain="post_tag"> to TagAttributes', () => {
			const squarespaceImporter = new SquarespaceImporter()

			const category = new JSDOM(
				publishedPostXml,
				{ contentType: "text/xml" }
			).window.document
				.querySelector("item")!
				.querySelector('category[domain="post_tag"]')!

			const expectedTagAttributes: Tag = {
				name: "House of Abundance",
				slug: "house-of-abundance"
			}

			expect(squarespaceImporter._convertToTagAttributes(category)).to.deep.eq(expectedTagAttributes)
		})
	})

	describe("_convertToDatumContainer", () => {
		it("should convert an item to a DatumContainer", () => {
			const pubDate = new Date("Mon, 02 Jan 2023 01:08:58 +0000");

			const item = new JSDOM(
				publishedPostXml,
				{ contentType: "text/xml" }
			).window.document
				.querySelector("item")!

			const squarespaceImporter = new SquarespaceImporter()

			const expectedDatumContainer: DatumContainer = {
				articleAttributes: {
					title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
					body: "<article>this is a post</article>",
					createdAt: pubDate,
					publishedAt: pubDate,
					updatedAt: pubDate,
					slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					author: "elle mundy",
					og_type: "article",
				},

				tagAttributesCollection: [
					{
						name: "House of Abundance",
						slug: "house-of-abundance"
					},
					{
						name: "Bed-Stuy",
						slug: "bed-stuy"
					},
					{
						name: "Brooklyn",
						slug: "brooklyn"
					},
					{
						name: "Stoop show",
						slug: "stoop-show"
					},
					{
						name: "Poetry reading",
						slug: "poetry-reading"
					},
					{
						name: "Live music",
						slug: "live-music"
					},
				],

				collectionAttributes: {
					name: "Photography",
					slug: "photography"
				},

				redirectAttributes: {
					from: "/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					httpCode: 301
				}
			}

			expect(squarespaceImporter._convertToDatumContainer(item)).to.deep.eq(expectedDatumContainer)
		})
	})

	describe("_collateToDataContainer", () => {
		it("should collate an array of DatumContainers into a DataContainer", () => {
			const datumContainers: DatumContainer[] = [{
				articleAttributes: {
					title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
					body: "<article>this is a post</article>",
					createdAt: pubDate,
					publishedAt: pubDate,
					updatedAt: pubDate,
					slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					author: "elle mundy",
					og_type: "article",
				},

				tagAttributesCollection: [
					{
						name: "House of Abundance",
						slug: "house-of-abundance"
					},
					{
						name: "Bed-Stuy",
						slug: "bed-stuy"
					},
					{
						name: "Brooklyn",
						slug: "brooklyn"
					},
					{
						name: "Stoop show",
						slug: "stoop-show"
					},
					{
						name: "Poetry reading",
						slug: "poetry-reading"
					},
					{
						name: "Live music",
						slug: "live-music"
					},
				],
				collectionAttributes: {
					name: "Photography",
					slug: "photography"
				},

				redirectAttributes: {
					from: "/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					httpCode: 301
				}
			},{
				articleAttributes: {
					title: "Another post",
					body: "<article>Another post</article>",
					createdAt: pubDate2,
					publishedAt: pubDate2,
					updatedAt: pubDate2,
					slug: "another-post-2023-12-22",
					author: "elle mundy",
					og_type: "article",
				},

				tagAttributesCollection: [
					{
						name: "Bed-Stuy",
						slug: "bed-stuy"
					},
				],

				collectionAttributes: {
					name: "Photography",
					slug: "photography"
				},

				redirectAttributes: {
					from: "/fotoblog/another-post-2023-12-22",
					httpCode: 301
				}
			}]

			const expectedDataContainer: DataContainer = {
				articleAttributesCollection: [{
					title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
					body: "<article>this is a post</article>",
					createdAt: pubDate,
					publishedAt: pubDate,
					updatedAt: pubDate,
					slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					author: "elle mundy",
					og_type: "article",
				}, {
					title: "Another post",
					body: "<article>Another post</article>",
					createdAt: pubDate2,
					publishedAt: pubDate2,
					updatedAt: pubDate2,
					slug: "another-post-2023-12-22",
					author: "elle mundy",
					og_type: "article",
				}],

				tagAttributesCollection: [
					{
						name: "House of Abundance",
						slug: "house-of-abundance"
					},
					{
						name: "Bed-Stuy",
						slug: "bed-stuy"
					},
					{
						name: "Brooklyn",
						slug: "brooklyn"
					},
					{
						name: "Stoop show",
						slug: "stoop-show"
					},
					{
						name: "Poetry reading",
						slug: "poetry-reading"
					},
					{
						name: "Live music",
						slug: "live-music"
					},
				],

				tagArticles: {
					"house-of-abundance": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"],
					"bed-stuy": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23", "another-post-2023-12-22"],
					"brooklyn": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"],
					"stoop-show": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"],
					"poetry-reading": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"],
					"live-music": ["rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"],
				},

				collectionAttributesCollection: [{
					name: "Photography",
					slug: "photography"
				}],

				collectionArticles: {
					"photography": [
						"rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						"another-post-2023-12-22"
					]
				},

				redirectAttributesCollection: [
					{
						from: "/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						httpCode: 301
					}, {
						from: "/fotoblog/another-post-2023-12-22",
						httpCode: 301
					}
				],

				redirectArticles: {
					"/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23": "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					"/fotoblog/another-post-2023-12-22": "another-post-2023-12-22"
				}
			}

			const squarespaceImporter = new SquarespaceImporter()

			expect(squarespaceImporter._collateToDataContainer(datumContainers)).to.deep.eq(expectedDataContainer)
		})
	})

	describe("_convertToRedirectAttributes", () => {
		it("should return a RedirectAttributes object with only the 'from' field populated", () => {
			const item = new JSDOM(
				publishedPostXml,
				{
					contentType: "text/xml",
					url: "http://localhost"
				}
			).window.document.querySelector("item")!

			const expectedRedirectAttributes: Redirect = {
				from: "/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
				httpCode: 301
			}

			const squarespaceImporter = new SquarespaceImporter()

			expect(squarespaceImporter._extractRedirectAttributes(item)).to.deep.eq(expectedRedirectAttributes)
		})
	})

	describe("_connectAttributesManyToMany", () => {
		it("should serve as a callback to Array#reduce, connecting one entity to many other entities", () => {
			const connections: Connection<Article["slug"][]> = {}

			const tagSlugHoa = "house-of-abundance"
			const tagSlugBs = "bed-stuy"
			const tagSlugBk = "brooklyn"
			const tagSlugStoop = "stoop-show"
			const tagSlugPr = "poetry-reading"
			const tagSlugLm = "live-music"
			const articleSlug = "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"

			const datumContainer: DatumContainer = {
				articleAttributes: {
					title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
					body: "<article>this is a post</article>",
					createdAt: pubDate,
					publishedAt: pubDate,
					updatedAt: pubDate,
					slug: articleSlug,
					author: "elle mundy",
					og_type: "article",
				},

				tagAttributesCollection: [
					{
						name: "House of Abundance",
						slug: tagSlugHoa
					},
					{
						name: "Bed-Stuy",
						slug: tagSlugBs
					},
					{
						name: "Brooklyn",
						slug: tagSlugBk
					},
					{
						name: "Stoop show",
						slug: tagSlugStoop
					},
					{
						name: "Poetry reading",
						slug: tagSlugPr
					},
					{
						name: "Live music",
						slug: tagSlugLm
					},
				],
				collectionAttributes: {
					name: "Photography",
					slug: "photography"
				},

				redirectAttributes: {
					from: "/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					httpCode: 301
				}
			}

			const expectedConnections: Connection<Article["slug"][]> = {
				[tagSlugHoa]: [articleSlug],
				[tagSlugBs]: [articleSlug],
				[tagSlugBk]: [articleSlug],
				[tagSlugStoop]: [articleSlug],
				[tagSlugPr]: [articleSlug],
				[tagSlugLm]: [articleSlug],
			}

			const squarespaceImporter = new SquarespaceImporter()

			expect(squarespaceImporter._connectAttributesManyToMany<Tag, Article>(
				"tagAttributesCollection",
				"slug",
				"articleAttributes",
				"slug"
			)(
				connections,
				datumContainer
			)).to.deep.eq(expectedConnections)
		})
	})

	describe("_connectAttributesOneToMany", () => {
		it("should serve as a callback to Array#reduce, connecting one entity to one other entity", () => {
			const connections: Connection<Article["slug"][]> = {}

			const articleSlug = "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"

			const collectionSlug = "photography"

			const datumContainer: DatumContainer = {
				articleAttributes: {
					title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
					body: "<article>this is a post</article>",
					createdAt: pubDate,
					publishedAt: pubDate,
					updatedAt: pubDate,
					slug: articleSlug,
					author: "elle mundy",
					og_type: "article",
				},

				tagAttributesCollection: [
					{
						name: "House of Abundance",
						slug: "house-of-abundance"
					},
					{
						name: "Bed-Stuy",
						slug: "bed-stuy"
					},
					{
						name: "Brooklyn",
						slug: "brooklyn"
					},
					{
						name: "Stoop show",
						slug: "stoop-show"
					},
					{
						name: "Poetry reading",
						slug: "poetry-reading"
					},
					{
						name: "Live music",
						slug: "live-music"
					},
				],
				collectionAttributes: {
					name: "Photography",
					slug: collectionSlug
				},

				redirectAttributes: {
					from: "/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					httpCode: 301
				}
			}

			const expectedConnections: Connection<Article["slug"][]> = {
				[collectionSlug]: [articleSlug],
			}

			const squarespaceImporter = new SquarespaceImporter()

			expect(squarespaceImporter._connectAttributesOneToMany<Collection, Article>(
				"collectionAttributes",
				"slug",
				"articleAttributes",
				"slug"
			)(
				connections,
				datumContainer
			)).to.deep.eq(expectedConnections)
		})
	})

	describe("_connectAttributesOneToOne", () => {
		const connections: Connection<string> = {}

		const articleSlug = "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"

		const redirectFrom = "/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23"

		const datumContainer: DatumContainer = {
			articleAttributes: {
				title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
				body: "<article>this is a post</article>",
				createdAt: pubDate,
				publishedAt: pubDate,
				updatedAt: pubDate,
				slug: articleSlug,
				author: "elle mundy",
				og_type: "article",
			},

			tagAttributesCollection: [
				{
					name: "House of Abundance",
					slug: "house-of-abundance"
				},
				{
					name: "Bed-Stuy",
					slug: "bed-stuy"
				},
				{
					name: "Brooklyn",
					slug: "brooklyn"
				},
				{
					name: "Stoop show",
					slug: "stoop-show"
				},
				{
					name: "Poetry reading",
					slug: "poetry-reading"
				},
				{
					name: "Live music",
					slug: "live-music"
				},
			],
			collectionAttributes: {
				name: "Photography",
				slug: "photography"
			},

			redirectAttributes: {
				from: redirectFrom,
				httpCode: 301
			}
		}

		const expectedConnections: Connection<Article["slug"]> = {
			[redirectFrom]: articleSlug,
		}

		const squarespaceImporter = new SquarespaceImporter()

		expect(squarespaceImporter._connectAttributesOneToOne<Redirect, Article>(
			"redirectAttributes",
			"from",
			"articleAttributes",
			"slug"
		)(
			connections,
			datumContainer
		)).to.deep.eq(expectedConnections)
	})
})

const getItemTextContent = (item: Element) =>
	item.outerHTML
		.replace(/ xmlns:content="http:\/\/purl.org\/rss\/1.0\/modules\/content\/"/g, "")
		.replace(/ xmlns:wp=".*"/g, "")
		.replace(/xmlns:excerpt="http:\/\/wordpress.org\/export\/1.2\/excerpt\/"/g, "")
		.replace(/ xmlns:dc=".*"/g, "")

const preamble = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:wp="http://wordpress.org/export/1.2/">
    <channel>`

const postamble = `    </channel>
</rss>
`

const pageXmlFragment = "<item>\n            <link>/contact</link>\n            <title>contact</title>\n            <pubDate>Mon, 02 Jan 2023 01:13:49 +0000</pubDate>\n            <content:encoded><![CDATA[<article>hi</article>]]></content:encoded>\n            <wp:post_name>contact</wp:post_name>\n            <wp:post_type>page</wp:post_type>\n            <wp:post_id>0</wp:post_id>\n            <wp:status>publish</wp:status>\n        </item>"

const pageXml = `${preamble}
				${pageXmlFragment}
${postamble}`

type CategoryXmlFragmentParams = { domain: any; nicename: any; cdata: any }

const publishedPostCategoryData: CategoryXmlFragmentParams[] = [
	{domain: "post_tag", nicename: "house-of-abundance", cdata: "House of Abundance"},
	{domain: "post_tag", nicename: "bed-stuy", cdata: "Bed-Stuy"},
	{domain: "post_tag", nicename: "brooklyn", cdata: "Brooklyn"},
	{domain: "post_tag", nicename: "stoop-show", cdata: "Stoop show"},
	{domain: "post_tag", nicename: "poetry-reading", cdata: "Poetry reading"},
	{domain: "post_tag", nicename: "live-music", cdata: "Live music"},
	{domain: "post_tag", nicename: "photography", cdata: "Photography"}
]

const publishedPost2CategoryData = [
	{domain: "post_tag", nicename: "bed-stuy", cdata: "Bed-Stuy"},
]

const categoryXmlFragment = (publishedPostCategoryDatum: CategoryXmlFragmentParams) =>
	`<category domain="${publishedPostCategoryDatum.domain}" nicename="${publishedPostCategoryDatum.nicename}"><![CDATA[${publishedPostCategoryDatum.cdata}]]></category>`

const publishedPostCategoriesXmlFragment = publishedPostCategoryData.map(categoryXmlFragment).join("            ")
const publishedPostCategories2XmlFragment = publishedPost2CategoryData.map(categoryXmlFragment).join("            ")

const publishedPostXmlFragment = `<item>
            <title>Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition</title>
            <link>/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23</link>
            <content:encoded><![CDATA[<article>this is a post</article>]]></content:encoded>
            <excerpt:encoded />
            <wp:post_name>rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23</wp:post_name>
            <wp:post_type>post</wp:post_type>
            <wp:post_id>1</wp:post_id>
            <wp:status>publish</wp:status>
            <pubDate>Mon, 02 Jan 2023 01:08:58 +0000</pubDate>
            <wp:post_date>2023-01-02 01:08:58</wp:post_date>
            <wp:post_date_gmt>2023-01-02 01:08:58</wp:post_date_gmt>
            ${publishedPostCategoriesXmlFragment}
            <dc:creator>exchgr@icloud.com</dc:creator>
            <wp:comment_status>closed</wp:comment_status>
            <wp:postmeta>
                <wp:meta_key>_thumbnail_id</wp:meta_key>
                <wp:meta_value><![CDATA[2]]></wp:meta_value>
            </wp:postmeta>
        </item>`

const publishedPostXml = `${preamble}
				${publishedPostXmlFragment}
${postamble}`

const publishedPost2XmlFragment = `<item>
            <title>Another post</title>
            <link>/fotoblog/another-post-2023-12-22</link>
            <content:encoded><![CDATA[<article>Another post</article>]]></content:encoded>
            <excerpt:encoded />
            <wp:post_name>another-post-2023-12-22</wp:post_name>
            <wp:post_type>post</wp:post_type>
            <wp:post_id>1</wp:post_id>
            <wp:status>publish</wp:status>
            <pubDate>Mon, 03 Jan 2023 01:08:58 +0000</pubDate>
            <wp:post_date>2023-01-03 01:08:58</wp:post_date>
            <wp:post_date_gmt>2023-01-03 01:08:58</wp:post_date_gmt>
            ${publishedPostCategories2XmlFragment}
            <dc:creator>exchgr@icloud.com</dc:creator>
            <wp:comment_status>closed</wp:comment_status>
            <wp:postmeta>
                <wp:meta_key>_thumbnail_id</wp:meta_key>
                <wp:meta_value><![CDATA[2]]></wp:meta_value>
            </wp:postmeta>
        </item>`

const draftPostXmlFragment = `<item>
            <title>DRAFT: Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition</title>
            <link>/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23</link>
            <content:encoded><![CDATA[<article>this is a post</article>]]></content:encoded>
            <excerpt:encoded />
            <wp:post_name>rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23</wp:post_name>
            <wp:post_type>post</wp:post_type>
            <wp:post_id>1</wp:post_id>
            <wp:status>draft</wp:status>
            <pubDate>Mon, 02 Jan 2023 01:08:58 +0000</pubDate>
            <wp:post_date>2023-01-02 01:08:58</wp:post_date>
            <wp:post_date_gmt>2023-01-02 01:08:58</wp:post_date_gmt>
            <category domain="post_tag" nicename="house-of-abundance"><![CDATA[House of Abundance]]></category>
            <category domain="post_tag" nicename="bed-stuy"><![CDATA[Bed-Stuy]]></category>
            <category domain="post_tag" nicename="brooklyn"><![CDATA[Brooklyn]]></category>
            <category domain="post_tag" nicename="stoop-show"><![CDATA[Stoop show]]></category>
            <category domain="post_tag" nicename="poetry-reading"><![CDATA[Poetry reading]]></category>
            <category domain="post_tag" nicename="live-music"><![CDATA[Live music]]></category>
            <category domain="post_tag" nicename="photography"><![CDATA[Photography]]></category>
            <dc:creator>exchgr@icloud.com</dc:creator>
            <wp:comment_status>closed</wp:comment_status>
            <wp:postmeta>
                <wp:meta_key>_thumbnail_id</wp:meta_key>
                <wp:meta_value><![CDATA[2]]></wp:meta_value>
            </wp:postmeta>
        </item>`

const draftPostXml = `${preamble}
				${draftPostXmlFragment}
${postamble}`

const squarespaceData = `${preamble}
    		${pageXmlFragment}
    		${publishedPostXmlFragment}
    		${publishedPost2XmlFragment}
    		${draftPostXmlFragment}
${postamble}`
