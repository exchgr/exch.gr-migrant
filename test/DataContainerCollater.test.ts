import {DatumContainer} from "../src/types/DatumContainer"
import {DataContainer} from "../src/types/DataContainer"
import {Redirect} from "../src/types/Redirect"
import {Connection} from "../src/types/Connection"
import {Article} from "../src/types/Article"
import {Tag} from "../src/types/Tag"
import {Collection} from "../src/types/Collection"
import {expect} from "chai"
import {
	_connectAttributesManyToMany,
	_connectAttributesOneToMany,
	_connectAttributesOneToOne,
	collateDataContainer
} from "../src/DataContainerCollater"

const pubDate = new Date("Mon, 02 Jan 2023 01:08:58 +0000");
const pubDate2 = new Date("Mon, 03 Jan 2023 01:08:58 +0000")

describe("collate", () => {
	it("should collate an array of DatumContainers into a DataContainer", () => {
		const datumContainers: DatumContainer[] = [{
			article: {
				title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
				body: "<article>this is a post</article>",
				createdAt: pubDate,
				publishedAt: pubDate,
				updatedAt: pubDate,
				slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
				author: "elle mundy",
				og_type: "article",
			},

			tags: [
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
			collection: {
				name: "Photography",
				slug: "photography"
			},

			redirect: {
				from: "/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
				httpCode: 301
			}
		},{
			article: {
				title: "Another post",
				body: "<article>Another post</article>",
				createdAt: pubDate2,
				publishedAt: pubDate2,
				updatedAt: pubDate2,
				slug: "another-post-2023-12-22",
				author: "elle mundy",
				og_type: "article",
			},

			tags: [
				{
					name: "Bed-Stuy",
					slug: "bed-stuy"
				},
			],

			collection: {
				name: "Photography",
				slug: "photography"
			},

			redirect: {
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

		expect(collateDataContainer(datumContainers)).to.deep.eq(expectedDataContainer)
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
			article: {
				title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
				body: "<article>this is a post</article>",
				createdAt: pubDate,
				publishedAt: pubDate,
				updatedAt: pubDate,
				slug: articleSlug,
				author: "elle mundy",
				og_type: "article",
			},

			tags: [
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
			collection: {
				name: "Photography",
				slug: "photography"
			},

			redirect: {
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

		expect(_connectAttributesManyToMany<Tag, Article>(
			"tags",
			"slug",
			"article",
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
			article: {
				title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
				body: "<article>this is a post</article>",
				createdAt: pubDate,
				publishedAt: pubDate,
				updatedAt: pubDate,
				slug: articleSlug,
				author: "elle mundy",
				og_type: "article",
			},

			tags: [
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
			collection: {
				name: "Photography",
				slug: collectionSlug
			},

			redirect: {
				from: "/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
				httpCode: 301
			}
		}

		const expectedConnections: Connection<Article["slug"][]> = {
			[collectionSlug]: [articleSlug],
		}

		expect(_connectAttributesOneToMany<Collection, Article>(
			"collection",
			"slug",
			"article",
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
		article: {
			title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
			body: "<article>this is a post</article>",
			createdAt: pubDate,
			publishedAt: pubDate,
			updatedAt: pubDate,
			slug: articleSlug,
			author: "elle mundy",
			og_type: "article",
		},

		tags: [
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
		collection: {
			name: "Photography",
			slug: "photography"
		},

		redirect: {
			from: redirectFrom,
			httpCode: 301
		}
	}

	const expectedConnections: Connection<Article["slug"]> = {
		[redirectFrom]: articleSlug,
	}

	expect(_connectAttributesOneToOne<Redirect, Article>(
		"redirect",
		"from",
		"article",
		"slug"
	)(
		connections,
		datumContainer
	)).to.deep.eq(expectedConnections)
})
