import {expect} from "chai";
import SquarespaceImporter from "../src/SquarespaceImporter";
import {JSDOM} from "jsdom";
import {Post} from "../src/Post";

describe("SquarespaceImporter", () => {
	describe("import", () => {
		it("should import only posts (and later, tags) from an XML data string", () => {
			const pubDate = new Date("Mon, 02 Jan 2023 01:08:58 +0000");
			const expectedPosts: Post[] = [{
				title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
				body: "<article>this is a post</article>",
				createdAt: pubDate,
				publishedAt: pubDate,
				updatedAt: pubDate,
				slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
				author: "elle mundy",
				collection: "Photography",
				og_type: "article",
			}]

			const squarespaceImporter = new SquarespaceImporter()

			expect(squarespaceImporter.import(squarespaceData)).to.deep.eq(expectedPosts)
		});
	})

	describe("_extractItems", () => {
		it("should extract items from xml", () => {
			const squarespaceImporter = new SquarespaceImporter()

			const items = squarespaceImporter._extractItems(squarespaceData);

			const itemsContents = getTextContents(items)
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
		it("should convert a Squarespace item to a post", () => {
			const squarespaceImporter = new SquarespaceImporter()

			const item = new JSDOM(
				publishedPostXml,
				{ contentType: "text/xml" }
			).window.document.querySelector("item")!

			const post = squarespaceImporter._convertToPost(item);

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
				og_type: "article",
			}

			expect(post).to.deep.eq(expectedPost)
		})
	})
})

const getTextContents = (items: Element[]) =>
	items.map(
		(item: Element) => item.outerHTML
			.replace(/ xmlns:content="http:\/\/purl.org\/rss\/1.0\/modules\/content\/"/g, "")
			.replace(/ xmlns:wp=".*"/g, "")
			.replace(/xmlns:excerpt="http:\/\/wordpress.org\/export\/1.2\/excerpt\/"/g, "")
			.replace(/ xmlns:dc=".*"/g, "")
	)

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

const publishedPostXmlFragment = "<item>\n            <title>Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition</title>\n            <link>/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23</link>\n            <content:encoded><![CDATA[<article>this is a post</article>]]></content:encoded>\n            <excerpt:encoded />\n            <wp:post_name>rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23</wp:post_name>\n            <wp:post_type>post</wp:post_type>\n            <wp:post_id>1</wp:post_id>\n            <wp:status>publish</wp:status>\n            <pubDate>Mon, 02 Jan 2023 01:08:58 +0000</pubDate>\n            <wp:post_date>2023-01-02 01:08:58</wp:post_date>\n            <wp:post_date_gmt>2023-01-02 01:08:58</wp:post_date_gmt>\n            <category domain=\"post_tag\" nicename=\"house-of-abundance\"><![CDATA[House of Abundance]]></category>\n            <category domain=\"post_tag\" nicename=\"bed-stuy\"><![CDATA[Bed-Stuy]]></category>\n            <category domain=\"post_tag\" nicename=\"brooklyn\"><![CDATA[Brooklyn]]></category>\n            <category domain=\"post_tag\" nicename=\"stoop-show\"><![CDATA[Stoop show]]></category>\n            <category domain=\"post_tag\" nicename=\"poetry-reading\"><![CDATA[Poetry reading]]></category>\n            <category domain=\"post_tag\" nicename=\"live-music\"><![CDATA[Live music]]></category>\n            <category domain=\"post_tag\" nicename=\"photography\"><![CDATA[Photography]]></category>\n            <dc:creator>exchgr@icloud.com</dc:creator>\n            <wp:comment_status>closed</wp:comment_status>\n            <wp:postmeta>\n                <wp:meta_key>_thumbnail_id</wp:meta_key>\n                <wp:meta_value><![CDATA[2]]></wp:meta_value>\n            </wp:postmeta>\n        </item>"

const publishedPostXml = `${preamble}
				${publishedPostXmlFragment}
${postamble}`

const draftPostXmlFragment = "<item>\n            <title>DRAFT: Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition</title>\n            <link>/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23</link>\n            <content:encoded><![CDATA[<article>this is a post</article>]]></content:encoded>\n            <excerpt:encoded />\n            <wp:post_name>rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23</wp:post_name>\n            <wp:post_type>post</wp:post_type>\n            <wp:post_id>1</wp:post_id>\n            <wp:status>draft</wp:status>\n            <pubDate>Mon, 02 Jan 2023 01:08:58 +0000</pubDate>\n            <wp:post_date>2023-01-02 01:08:58</wp:post_date>\n            <wp:post_date_gmt>2023-01-02 01:08:58</wp:post_date_gmt>\n            <category domain=\"post_tag\" nicename=\"house-of-abundance\"><![CDATA[House of Abundance]]></category>\n            <category domain=\"post_tag\" nicename=\"bed-stuy\"><![CDATA[Bed-Stuy]]></category>\n            <category domain=\"post_tag\" nicename=\"brooklyn\"><![CDATA[Brooklyn]]></category>\n            <category domain=\"post_tag\" nicename=\"stoop-show\"><![CDATA[Stoop show]]></category>\n            <category domain=\"post_tag\" nicename=\"poetry-reading\"><![CDATA[Poetry reading]]></category>\n            <category domain=\"post_tag\" nicename=\"live-music\"><![CDATA[Live music]]></category>\n            <category domain=\"post_tag\" nicename=\"photography\"><![CDATA[Photography]]></category>\n            <dc:creator>exchgr@icloud.com</dc:creator>\n            <wp:comment_status>closed</wp:comment_status>\n            <wp:postmeta>\n                <wp:meta_key>_thumbnail_id</wp:meta_key>\n                <wp:meta_value><![CDATA[2]]></wp:meta_value>\n            </wp:postmeta>\n        </item>"

const draftPostXml = `${preamble}
				${draftPostXmlFragment}
${postamble}`

const squarespaceData = `${preamble}
    		${pageXmlFragment}
    		${publishedPostXmlFragment}
    		${draftPostXmlFragment}
${postamble}`
