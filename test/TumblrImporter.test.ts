import {JSDOM} from "jsdom"
import {DatumContainer} from "../src/types/DatumContainer"
import TumblrImporter from "../src/TumblrImporter"
import { expect } from "chai";
import {TumblrPost} from "../src/types/TumblrPost"
import {Tag} from "../src/types/Tag"
import {Article} from "../src/types/Article"
import moment from "moment";

describe("TumblrImporter", () => {
	describe("import", () => {
		it("should import only articles with tags, and collections, and redirects from an XML data string", () => {
			const datumContainers: DatumContainer[] = [
				essayDatumContainer,
				drawingDatumContainer
			]

			const tumblrImporter = new TumblrImporter()

			expect(tumblrImporter.import(tumblrData)).to.deep.eq(datumContainers)
		})
	})

	describe("_isEssay", () => {
		it("should return true if the post is an essay", () => {
			const tumblrImporter = new TumblrImporter()

			expect(tumblrImporter._isPost(essay)).to.be.true
		})

		it("should return false if the post is not an essay", () => {
			const tumblrImporter = new TumblrImporter()

			expect(tumblrImporter._isPost(drawing)).to.be.false
		})
	})

	describe("_essayToDatumContainer", () => {
		it("should return a DatumContainer based on an essay-shaped TumblrPost", () => {
			const tumblrImporter = new TumblrImporter()

			expect(tumblrImporter._postToDatumContainer(essay)).to.deep.eq(essayDatumContainer)
		})
	})

	describe("_convertPostDomToArticle", () => {
		it("should convert post-shaped HTML to Article", () => {
			const tumblrImporter = new TumblrImporter()

			expect(tumblrImporter._convertPostDomToArticle(essay.dom)).to.deep.eq(essayArticle)
		})
	})

	describe("_extractTags", () => {
		it("should construct Tags from a TumblrPost's dom", () => {
			const tumblrImporter = new TumblrImporter()
			expect(tumblrImporter._extractTags(essay.dom)).to.deep.eq(essayTags)
		})

		it("should exclude predefined Collections", () => {
			const tumblrImporter = new TumblrImporter()
			expect(tumblrImporter._extractTags(drawing.dom)).to.deep.eq(imageTagsWithoutCollection)
		})
	})

	describe("_extractCollections", () => {
		it("should construct a Collection from a TumblrPost's dom", () => {
			const tumblrImporter = new TumblrImporter()
			expect(tumblrImporter._extractCollection(drawing.dom)).to.deep.eq(drawingCollection)
		})

		it("should return the default essays collection if no other collection tag exists", () => {
			const tumblrImporter = new TumblrImporter()
			expect(tumblrImporter._extractCollection(essay.dom)).to.deep.eq(essayCollection)
		})
	})

	describe("_constructPostRedirect", () => {
		it("should construct a Redirect from a post-shaped TumblrPost's dom", () => {
			const tumblrImporter = new TumblrImporter()
			expect(tumblrImporter._constructPostRedirect(essay)).to.deep.eq(essayRedirect)
		})
	})

	describe("_isImage", () => {
		it("should return true if the post is an image", () => {
			const tumblrImporter = new TumblrImporter()
			expect(tumblrImporter._isImage(drawing)).to.be.true
		})

		it("should return false if the post is not an image", () => {
			const tumblrImporter = new TumblrImporter()
			expect(tumblrImporter._isImage(essay)).to.be.false
		})
	})

	describe("_imageToDatumContainer", () => {
		it("should return a DatumContainer based on an image-shaped TumblrPost", () => {
			const tumblrImporter = new TumblrImporter()

			expect(tumblrImporter._imageToDatumContainer(drawing)).to.deep.eq(drawingDatumContainer)
		})
	})

	describe("_convertImageDomToArticle", () => {
		it("should convert image-shaped HTML to Article", () => {
			const tumblrImporter = new TumblrImporter()

			expect(tumblrImporter._convertImageDomToArticle(drawing.dom)).to.deep.eq(drawingArticle)
		})
	})

	describe("_constructImageRedirect", () => {
		it("should construct a Redirect from an image-shaped TumblrPost's dom", () => {
			const tumblrImporter = new TumblrImporter()
			expect(tumblrImporter._constructImageRedirect(drawing)).to.deep.eq(drawingRedirect)
		})
	})
})

const essayTitle: string = "Home Audio Evolution, Part 3: UE Boom"

const essayBody: string = `    <p>
      This is part 3 of a series of posts on the evolution of my home audio setup. <a href="https://www.processthings.com/post/672939380171833344/home-audio-evolution-part-2-jawbone-jambox" target="_blank">Read part 2</a>, or <a href="https://www.processthings.com/post/672129007790292992/home-audio-evolution-part-1-sony-phc-z10" target="_blank">start from the beginning</a>.</p>
    <p>In 2013, I got fed up with struggling to hear the underpowered Jambox in my car, and I sprung for a <a href="https://en.wikipedia.org/wiki/UE_Boom" target="_blank">UE Boom</a> in blue, white, and yellow.</p>
    <figure class="third right captioned" data-orig-height="1200" data-orig-width="600"><img src="https://64.media.tumblr.com/535105e165e13d9e0d5aa19397d682d0/de5f97b5506aafc9-3f/s540x810/7763aac2bbb935740e4fca029c847a8bd1c020ee.png" alt="" data-orig-height="1200" data-orig-width="600"><figcaption>The original UE Boom.</figcaption></figure><p>This thing was great. I did a little research online, as well as some in-person tests at the local big box store. The Boom was the only compact Bluetooth speaker that could compete with the cacophony of other shoppers doing their tests, which sounded about as loud as typical road noise, if not louder. And indeed, when I jammed it between my windshield and dashboard, it was quite loud enough without even approaching full volume. Even better, it was able to link its volume controls between itself and the source device, so I could control it from either place without worrying about keeping one or the other at full volume, unlike with the Jambox, which had its own independent volume level. It served me well.</p>
    <p>But over the years, I found myself wishing it had more bass. Granted, for a speaker of its size, it was fantastically rich and well-balanced, thanks to its <a href="https://en.wikipedia.org/wiki/Passive_radiator_(speaker)" target="_blank">passive radiators</a>. But unfortunately, being good for its size did not mean it was good enough to be my main home audio speaker. In the ensuing four years, I’d moved to New York, gotten an apartment of my own, and frankly, I had a lot more income. For the amount of bass-heavy music I was listening to, I needed a speaker that could actually reproduce it.</p>
    <p>Find out what the next speaker was in the next post in this series. Subscribe to this site’s <a href="/rss" target="_blank">RSS feed</a> to stay tuned.</p>
`

const essayPubDateString = "January 20th, 2022 9:40pm"
const essayPubDate = moment(essayPubDateString, "MMMM Do, YYYY h:mma").toDate()

const essayTags: Tag[] = [
	{
		name: "home audio systems",
		slug: "home-audio-systems"
	},
	{
		name: "home audio evolution",
		slug: "home-audio-evolution",
	},
	{
		name: "speakers",
		slug: "speakers",
	},
	{
		name: "audio equipment",
		slug: "audio-equipment",
	},
	{
		name: "bluetooth speakers",
		slug: "bluetooth-speakers",
	},
	{
		name: "bluetooth",
		slug: "bluetooth",
	},
	{
		name: "ue boom",
		slug: "ue-boom",
	},
	{
		name: "ultimate ears",
		slug: "ultimate-ears",
	}
]

const tagHtmlFragment = (tag: Tag) =>
	`      <span class="tag">${tag.name}</span>`

const essayTagHtmlFragments = essayTags.map(tagHtmlFragment)

const imageTitle = 'premium goods'

const imageBody = `<figure class="tmblr-full" data-orig-height="1023" data-orig-width="1243"><img src="https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s640x960/fd76b2161a22a9e8b27fc08ef4f79015e506a106.jpg" data-orig-height="1023" data-orig-width="1243" srcset="https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s75x75_c1/ca64c57d82a4a1f707becd76c4818556931f32fb.jpg 75w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s100x200/c62e1e0ea262bd6966f5794af5e108a86e36bdc7.jpg 100w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s250x400/e8f7be0acf534024b12fc08c50ebc5399bc06720.jpg 250w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s400x600/b5083c246c50622bb93c63302d7b5a90046bb8d5.jpg 400w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s500x750/ce6437879990e41ae6338f37b2ca0c7524314e6c.jpg 500w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s540x810/e352357f8d686aaf4cf5f88f4e549c22f5f66293.jpg 540w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s640x960/fd76b2161a22a9e8b27fc08ef4f79015e506a106.jpg 640w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s1280x1920/4fa2414a08b0f19648c8e7e6c7c9cacb5267f2c8.jpg 1243w" sizes="(max-width: 1243px) 100vw, 1243px"></figure>`

const imagePubDateString = "January 20th, 2020 10:23pm"
const imagePubDate = moment(imagePubDateString, "MMMM Do, YYYY h:mma").toDate()

const imageTagsWithoutCollection = [
	{
		name: "box",
		slug: "box"
	},
	{
		name: "shipping",
		slug: "shipping"
	},
	{
		name: "art",
		slug: "art"
	}
]

const imageTags: Tag[] = [
	{
		name: "drawing",
		slug: "drawing"
	},
	...imageTagsWithoutCollection
]

const imageTagHtmlFragments = imageTags.map(tagHtmlFragment)

const essay: TumblrPost = {
	id: "673954189579288576",
	dom: new JSDOM(
		`<!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
		<link rel="stylesheet" type="text/css" href="../style.css"/>
	</head>
	<body>
		<h1>${essayTitle}</h1>
		${essayBody}
		<div id="footer">
			<span id="timestamp"> ${essayPubDateString} </span>
${essayTagHtmlFragments}
		</div>
	</body>
</html>
`,
		{
			contentType: "text/html",
			url: "http://localhost"
		}
	).window.document
}

const drawing: TumblrPost = {
	id: "190376479142",
	dom: new JSDOM(
		`<!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
		<link rel="stylesheet" type="text/css" href="../style.css"/>
		</head>
	<body>


		<h1></h1>
		<div class="npf_row">${imageBody}</div><p class="npf_chat">${imageTitle}</p>
		<div id="footer">
			<span id="timestamp"> ${imagePubDateString} </span>
${imageTagHtmlFragments}
		</div>
	</body>
</html>
`,
		{
			contentType: "text/html",
			url: "http://localhost"
		}
	).window.document
}

const tumblrData = [
	essay,
	drawing
]

const essayArticle: Article = {
	title: essayTitle,
	body: `${essayBody.trim()}`,
	createdAt: essayPubDate,
	publishedAt: essayPubDate,
	updatedAt: essayPubDate,
	slug: "home-audio-evolution-part-3-ue-boom",
	author: "elle mundy",
	og_type: "article",
}

const essayCollection = {
	name: "Essays",
	slug: "essays"
}

const essayRedirect = {
	from: "/post/673954189579288576/home-audio-evolution-part-3-ue-boom",
	httpCode: 301
}
const essayDatumContainer: DatumContainer = {
	articleAttributes: essayArticle,

	tagAttributesCollection: essayTags,
	collectionAttributes: essayCollection,

	redirectAttributes: essayRedirect
}

const drawingCollection = {
	name: "Drawing",
	slug: "drawing"
}

const drawingArticle = {
	title: imageTitle,
	body: `${imageBody}`,
	createdAt: imagePubDate,
	publishedAt: imagePubDate,
	updatedAt: imagePubDate,
	slug: 'premium-goods',
	author: "elle mundy",
	og_type: "article",
}

const drawingRedirect = {
	from: "/post/190376479142/premium-goods",
	httpCode: 301
}

const drawingDatumContainer: DatumContainer = {
	articleAttributes: drawingArticle,

	tagAttributesCollection: imageTagsWithoutCollection,

	collectionAttributes: drawingCollection,

	redirectAttributes: drawingRedirect
}
