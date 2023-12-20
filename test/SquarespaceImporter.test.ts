import {expect} from "chai"
import SquarespaceImporter from "../src/SquarespaceImporter"
import {JSDOM} from "jsdom"
import {Post} from "../src/types/Post"
import {Tag} from "../src/types/Tag"
import {DataContainer} from "../src/types/DataContainer"
import {PostTag} from "../src/types/PostTag"
import {DatumContainer} from "../src/types/DatumContainer"

describe("SquarespaceImporter", () => {
	describe("import", () => {
		it("should import only posts (and later, tags) from an XML data string", () => {
			const pubDate = new Date("Mon, 02 Jan 2023 01:08:58 +0000");

			const expectedDataContainer: DataContainer = {
				posts: [{
					title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
					body: "<article>this is a post</article>",
					createdAt: pubDate,
					publishedAt: pubDate,
					updatedAt: pubDate,
					slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					author: "elle mundy",
					collection: "Photography",
					og_type: "article",
				}],

				postTags: [
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "house-of-abundance"
					},
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "bed-stuy"
					},
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "brooklyn"
					},
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "stoop-show"
					},
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "poetry-reading"
					},
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "live-music"
					},
				],

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
				]
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
			const expectedItemsContents = [pageXmlFragment, publishedPostXmlFragment, draftPostXmlFragment]

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

			const expectedPost: Post = {
				title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
				body: "<article>this is a post</article>",
				createdAt: pubDate,
				publishedAt: pubDate,
				updatedAt: pubDate,
				slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
				author: "elle mundy",
				collection: "Photography",
				og_type: "article"
			}

			expect(squarespaceImporter._convertToPost(item)).to.deep.eq(expectedPost)
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
		it('should convert an xml <category domain="post_tag"> to a Tag', () => {
			const squarespaceImporter = new SquarespaceImporter()

			const category = new JSDOM(
				publishedPostXml,
				{ contentType: "text/xml" }
			).window.document
				.querySelector("item")!
				.querySelector('category[domain="post_tag"]')!

			const expectedTag: Tag = {
				name: "House of Abundance",
				slug: "house-of-abundance"
			}

			expect(squarespaceImporter._convertToTag(category)).to.deep.eq(expectedTag)
		})
	})

	describe("_connectPostTag", () => {
		it("should connect a post and a tag from an xml <item> to a PostTag", () => {
			const pubDate = new Date("Mon, 02 Jan 2023 01:08:58 +0000");

			const post: Post = {
				title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
				body: "<article>this is a post</article>",
				createdAt: pubDate,
				publishedAt: pubDate,
				updatedAt: pubDate,
				slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
				author: "elle mundy",
				collection: "Photography",
				og_type: "article"
			}

			const tag: Tag = {
				name: "House of Abundance",
				slug: "house-of-abundance"
			}

			const expectedPostTag: PostTag = {
				postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
				tagSlug: "house-of-abundance"
			}


			const squarespaceImporter = new SquarespaceImporter()

			expect(squarespaceImporter._connectPostTag(post, tag)).to.deep.eq(expectedPostTag)
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
				post: {
					title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
					body: "<article>this is a post</article>",
					createdAt: pubDate,
					publishedAt: pubDate,
					updatedAt: pubDate,
					slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
					author: "elle mundy",
					collection: "Photography",
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

				postTags: [
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "house-of-abundance"
					},
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "bed-stuy"
					},
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "brooklyn"
					},
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "stoop-show"
					},
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "poetry-reading"
					},
					{
						postSlug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
						tagSlug: "live-music"
					},
				]
			}

			expect(squarespaceImporter._convertToDatumContainer(item)).to.deep.eq(expectedDatumContainer)
		})
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

const publishedPostCategoryData = [
	{domain: "post_tag", nicename: "house-of-abundance", cdata: "House of Abundance"},
	{domain: "post_tag", nicename: "bed-stuy", cdata: "Bed-Stuy"},
	{domain: "post_tag", nicename: "brooklyn", cdata: "Brooklyn"},
	{domain: "post_tag", nicename: "stoop-show", cdata: "Stoop show"},
	{domain: "post_tag", nicename: "poetry-reading", cdata: "Poetry reading"},
	{domain: "post_tag", nicename: "live-music", cdata: "Live music"},
	{domain: "post_tag", nicename: "photography", cdata: "Photography"}
]

const publishedPostCategoryXmlFragments = publishedPostCategoryData.map((publishedPostCategoryDatum) =>
	`<category domain="${publishedPostCategoryDatum.domain}" nicename="${publishedPostCategoryDatum.nicename}"><![CDATA[${publishedPostCategoryDatum.cdata}]]></category>`
)

const publishedPostCategoriesXmlFragment = publishedPostCategoryXmlFragments.join("            ")

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
    		${draftPostXmlFragment}
${postamble}`
