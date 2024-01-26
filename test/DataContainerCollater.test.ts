import {DatumContainer} from "../src/types/DatumContainer"
import {DataContainer} from "../src/types/DataContainer"
import SquarespaceImporter from "../src/SquarespaceImporter"
import {Redirect} from "../src/types/Redirect"
import {Connection} from "../src/types/Connection"
import {Article} from "../src/types/Article"
import {Tag} from "../src/types/Tag"
import {Collection} from "../src/types/Collection"
import { expect } from "chai"
import {DataContainerCollater} from "../src/DataContainerCollater"

describe("DataContainerCollater", () => {
	const pubDate = new Date("Mon, 02 Jan 2023 01:08:58 +0000");
	const pubDate2 = new Date("Mon, 03 Jan 2023 01:08:58 +0000")

	describe("collate", () => {
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

			const dataContainerCollater = new DataContainerCollater()

			expect(dataContainerCollater.collate(datumContainers)).to.deep.eq(expectedDataContainer)
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

			const dataContainerCollater = new DataContainerCollater()

			expect(dataContainerCollater._connectAttributesManyToMany<Tag, Article>(
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

			const dataContainerCollater = new DataContainerCollater()

			expect(dataContainerCollater._connectAttributesOneToMany<Collection, Article>(
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

		const dataContainerCollater = new DataContainerCollater()

		expect(dataContainerCollater._connectAttributesOneToOne<Redirect, Article>(
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
