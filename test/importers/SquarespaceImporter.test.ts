import {expect} from "chai"
import {
	_constructArticle,
	_constructRedirect,
	_constructTag,
	_convertToDatumContainer,
	_extractCategories,
	_extractItems,
	_isPost,
	_isPublished,
	importSquarespace
} from "../../src/importers/SquarespaceImporter"
import {JSDOM} from "jsdom"
import {Article} from "../../src/types/Article"
import {DatumContainer} from "../../src/types/DatumContainer"

const pubDate = new Date("Mon, 02 Jan 2023 01:08:58 +0000")
const pubDate2 = new Date("Mon, 03 Jan 2023 01:08:58 +0000")

describe("importSquarespace", () => {
	it("should import only articles with tags, and collections, and redirects from an XML data string", () => {
		const expectedDatumContainers: DatumContainer[] = [
			socialMediaDatumContainer,
			anotherPostDatumContainer
		]

		expect(importSquarespace(squarespaceData)).to.deep.eq(expectedDatumContainers)
	});
})

describe("_extractItems", () => {
	it("should extract items from xml", () => {
		const items = _extractItems(squarespaceData);

		const itemsContents = items.map(getItemTextContent)
		const expectedItemsContents = [pageXmlFragment, socialMediaPostXmlFragment, AnotherPostXmlFragment, draftPostXmlFragment]

		itemsContents.map((itemContent, index) => {
			expect(itemContent).to.eq(expectedItemsContents[index])
		})
	})
})

describe("_isPost", () => {
	it("should return true if wp:post_type is post", () => {
		const postItem = new JSDOM(
			 socialMediaPostXml,
			{ contentType: "text/xml" }
		).window.document.querySelector("item")!

		expect(_isPost(postItem)).to.be.true
	})


	it("should return false if wp:post_type is not post", () => {
		const pageItem = new JSDOM(
			pageXml,
			{ contentType: "text/xml" }
		).window.document.querySelector("item")!

		expect(_isPost(pageItem)).to.be.false
	})
})

describe("_isPublished", () => {
	it("should return true if wp:status is 'publish'", () => {
		const publishedItem = new JSDOM(
			 socialMediaPostXml,
			{ contentType: "text/xml" }

		).window.document.querySelector("item")!

		expect(_isPublished(publishedItem)).to.be.true
	})

	it("should return false if wp:status is not 'publish'", () => {
		const draftItem = new JSDOM(
			draftPostXml,
			{ contentType: "text/xml" }
		).window.document.querySelector("item")!

		expect(_isPublished(draftItem)).to.be.false
	})
})

describe("_constructArticle", () => {
	it("should convert a Squarespace item to a Article with Tags, excluding Photography", () => {
		const item = new JSDOM(
			 socialMediaPostXml,
			{ contentType: "text/xml" }
		).window.document.querySelector("item")!

		const pubDate = new Date("Mon, 02 Jan 2023 01:08:58 +0000");

		expect(_constructArticle(item)).to.deep.eq(socialMediaArticle)
	})
})

describe("_extractCategories", () => {
	it("should extract an array of Tags from an xml <item>", () => {
		const item = new JSDOM(
			 socialMediaPostXml,
			{
				contentType: "text/xml",
				url: "http://localhost"
			}
		).window.document.querySelector("item")!

		_extractCategories(item).forEach((category: Element, index: number) => {
			const expectedCategory: {[key: string]: string} = socialMediaPostCategoryData[index]

			expect(Array.from(category.childNodes)[0].textContent!).to.eq(expectedCategory.cdata)

			Array.from(category.attributes).forEach((attribute: Attr) => {
				expect(attribute.value).to.eq(expectedCategory[attribute.name])
			})
		})
	})
})

describe("_constructTag", () => {
	it('should convert an xml <category domain="post_tag"> to TagAttributes', () => {
		const category = new JSDOM(
			 socialMediaPostXml,
			{ contentType: "text/xml" }
		).window.document
			.querySelector("item")!
			.querySelector('category[domain="post_tag"]')!

		expect(_constructTag(category)).to.deep.eq(houseOfAbundanceTag)
	})
})

describe("_convertToDatumContainer", () => {
	it("should convert an item to a DatumContainer", () => {
		const item = new JSDOM(
			 socialMediaPostXml,
			{ contentType: "text/xml" }
		).window.document
			.querySelector("item")!

		expect(_convertToDatumContainer(item)).to.deep.eq(
			socialMediaDatumContainer
		)
	})
})

describe("_constructRedirect", () => {
	it("should return a RedirectAttributes object with only the 'from' field populated", () => {
		const item = new JSDOM(
			 socialMediaPostXml,
			{
				contentType: "text/xml",
				url: "http://localhost"
			}
		).window.document.querySelector("item")!

		expect(_constructRedirect(item)).to.deep.eq(socialMediaRedirect)
	})
})

const socialMediaArticle = {
	title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
	body: "<div>this is a post</div>",
	createdAt: pubDate,
	publishedAt: pubDate,
	updatedAt: pubDate,
	slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
	author: "elle mundy",
	og_type: "article"
}

const socialMediaRedirect = {
	from: "/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
	httpCode: 301
}

const houseOfAbundanceTag = {
	name: "House of Abundance",
	slug: "house-of-abundance"
}

const socialMediaDatumContainer = {
	article: socialMediaArticle,

	tags: [
		houseOfAbundanceTag,
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

	redirect: socialMediaRedirect
}

const anotherPostDatumContainer = {
	article: {
		title: "Another post",
		body: "<div>Another post</div>",
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
}

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

const socialMediaPostCategoryData: CategoryXmlFragmentParams[] = [
	{domain: "post_tag", nicename: "house-of-abundance", cdata: "House of Abundance"},
	{domain: "post_tag", nicename: "bed-stuy", cdata: "Bed-Stuy"},
	{domain: "post_tag", nicename: "brooklyn", cdata: "Brooklyn"},
	{domain: "post_tag", nicename: "stoop-show", cdata: "Stoop show"},
	{domain: "post_tag", nicename: "poetry-reading", cdata: "Poetry reading"},
	{domain: "post_tag", nicename: "live-music", cdata: "Live music"},
	{domain: "post_tag", nicename: "photography", cdata: "Photography"}
]

const anotherPostCategoryData = [
	{domain: "post_tag", nicename: "bed-stuy", cdata: "Bed-Stuy"},
]

const categoryXmlFragment = (categoryDatum: CategoryXmlFragmentParams) =>
	`<category domain="${categoryDatum.domain}" nicename="${categoryDatum.nicename}"><![CDATA[${categoryDatum.cdata}]]></category>`

const socialMediaPostCategoriesXmlFragment = socialMediaPostCategoryData.map(categoryXmlFragment).join("            ")
const AnotherPostCategoriesXmlFragment = anotherPostCategoryData.map(categoryXmlFragment).join("            ")

const socialMediaPostXmlFragment = `<item>
            <title>Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition</title>
            <link>/fotoblog/rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23</link>
            <content:encoded><![CDATA[<div>this is a post</div>]]></content:encoded>
            <excerpt:encoded />
            <wp:post_name>rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23</wp:post_name>
            <wp:post_type>post</wp:post_type>
            <wp:post_id>1</wp:post_id>
            <wp:status>publish</wp:status>
            <pubDate>Mon, 02 Jan 2023 01:08:58 +0000</pubDate>
            <wp:post_date>2023-01-02 01:08:58</wp:post_date>
            <wp:post_date_gmt>2023-01-02 01:08:58</wp:post_date_gmt>
            ${socialMediaPostCategoriesXmlFragment}
            <dc:creator>exchgr@icloud.com</dc:creator>
            <wp:comment_status>closed</wp:comment_status>
            <wp:postmeta>
                <wp:meta_key>_thumbnail_id</wp:meta_key>
                <wp:meta_value><![CDATA[2]]></wp:meta_value>
            </wp:postmeta>
        </item>`

const socialMediaPostXml = `${preamble}
				${socialMediaPostXmlFragment}
${postamble}`

const AnotherPostXmlFragment = `<item>
            <title>Another post</title>
            <link>/fotoblog/another-post-2023-12-22</link>
            <content:encoded><![CDATA[<div>Another post</div>]]></content:encoded>
            <excerpt:encoded />
            <wp:post_name>another-post-2023-12-22</wp:post_name>
            <wp:post_type>post</wp:post_type>
            <wp:post_id>1</wp:post_id>
            <wp:status>publish</wp:status>
            <pubDate>Mon, 03 Jan 2023 01:08:58 +0000</pubDate>
            <wp:post_date>2023-01-03 01:08:58</wp:post_date>
            <wp:post_date_gmt>2023-01-03 01:08:58</wp:post_date_gmt>
            ${AnotherPostCategoriesXmlFragment}
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
            <content:encoded><![CDATA[this is a post]]></content:encoded>
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
    		${socialMediaPostXmlFragment}
    		${AnotherPostXmlFragment}
    		${draftPostXmlFragment}
${postamble}`
