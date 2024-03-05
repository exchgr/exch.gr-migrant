import {JSDOM} from "jsdom"
import {DatumContainer} from "../../src/types/DatumContainer"
import { expect } from "chai";
import {TumblrPost} from "../../src/types/TumblrPost"
import {Tag} from "../../src/types/Tag"
import {Article} from "../../src/types/Article"
import moment from "moment";
import {
	_sanitizeBody,
	_constructCollection,
	_constructPhotoArticle,
	_constructPhotoRedirect,
	_constructTags,
	_constructTextArticle,
	_constructTextRedirect,
	_isPhoto,
	_isText,
	_photoToDatumContainer,
	_textToDatumContainer,
	importTumblr
} from "../../src/importers/TumblrImporter"

describe("importTumblr", () => {
	it("should import only articles with tags, and collections, and redirects from an XML data string", () => {
		const datumContainers: DatumContainer[] = [
			essayDatumContainer,
			drawingDatumContainer
		]

		expect(importTumblr(tumblrData)).to.deep.eq(datumContainers)
	})
})

describe("_isText", () => {
	it("should return true if the post is an essay", () => {
		expect(_isText(essay)).to.be.true
	})

	it("should return false if the post is not an essay", () => {
		expect(_isText(drawing)).to.be.false
	})
})

describe("_textToDatumContainer", () => {
	it("should return a DatumContainer based on an essay-shaped TumblrPost", () => {
		expect(_textToDatumContainer(essay)).to.deep.eq(essayDatumContainer)
	})
})

describe("_sanitizeBody", () => {
	it("should replace imgs with local export's file as src and trim whitespace", () => {
		const body = essay.dom.createElement("body")
		body.innerHTML = essayBodyOriginal

		expect(_sanitizeBody(essay.id, body)).to.eq(essayBodySanitized)
	})
})

describe("_constructTextArticle", () => {
	it("should convert post-shaped HTML to Article", () => {
		expect(_constructTextArticle(essay)).to.deep.eq(essayArticle)
	})
})

describe("_constructTags", () => {
	it("should construct Tags from a TumblrPost's dom", () => {
		expect(_constructTags(essay.dom)).to.deep.eq(essayTags)
	})

	it("should exclude predefined Collections", () => {
		expect(_constructTags(drawing.dom)).to.deep.eq(photoTagsWithoutCollection)
	})
})

describe("_constructCollection", () => {
	it("should construct a Collection from a TumblrPost's dom", () => {
		expect(_constructCollection(drawing.dom)).to.deep.eq(drawingCollection)
	})

	it("should return the default essays collection if no other collection tag exists", () => {
		expect(_constructCollection(essay.dom)).to.deep.eq(essayCollection)
	})
})

describe("_constructTextRedirect", () => {
	it("should construct a Redirect from a post-shaped TumblrPost's dom", () => {
		expect(_constructTextRedirect(essay)).to.deep.eq(essayRedirect)
	})
})

describe("_isPhoto", () => {
	it("should return true if the post is an photo", () => {
		expect(_isPhoto(drawing)).to.be.true
	})

	it("should return false if the post is not an photo", () => {
		expect(_isPhoto(essay)).to.be.false
	})
})

describe("_photoToDatumContainer", () => {
	it("should return a DatumContainer based on an photo-shaped TumblrPost", () => {
		expect(_photoToDatumContainer(drawing)).to.deep.eq(drawingDatumContainer)
	})
})

describe("_constructPhotoArticle", () => {
	it("should convert photo-shaped HTML to Article", () => {
		expect(_constructPhotoArticle(drawing)).to.deep.eq(drawingArticle)
	})
})

describe("_constructPhotoRedirect", () => {
	it("should construct a Redirect from an photo-shaped TumblrPost's dom", () => {
		expect(_constructPhotoRedirect(drawing)).to.deep.eq(drawingRedirect)
	})
})

const essayTitle: string = "Home Audio Evolution, Part 3: UE Boom"

const essayBodyOriginal: string = `    <p>
      This is part 3 of a series of posts on the evolution of my home audio setup. <a href="https://www.processthings.com/post/672939380171833344/home-audio-evolution-part-2-jawbone-jambox" target="_blank">Read part 2</a>, or <a href="https://www.processthings.com/post/672129007790292992/home-audio-evolution-part-1-sony-phc-z10" target="_blank">start from the beginning</a>.</p>
    <p>In 2013, I got fed up with struggling to hear the underpowered Jambox in my car, and I sprung for a <a href="https://en.wikipedia.org/wiki/UE_Boom" target="_blank">UE Boom</a> in blue, white, and yellow.</p>
    <figure class="third right captioned" data-orig-height="1200" data-orig-width="600"><img src="https://64.media.tumblr.com/535105e165e13d9e0d5aa19397d682d0/de5f97b5506aafc9-3f/s540x810/7763aac2bbb935740e4fca029c847a8bd1c020ee.png" alt="" data-orig-height="1200" data-orig-width="600"><figcaption>The original UE Boom.</figcaption></figure><p>This thing was great. I did a little research online, as well as some in-person tests at the local big box store. The Boom was the only compact Bluetooth speaker that could compete with the cacophony of other shoppers doing their tests, which sounded about as loud as typical road noise, if not louder. And indeed, when I jammed it between my windshield and dashboard, it was quite loud enough without even approaching full volume. Even better, it was able to link its volume controls between itself and the source device, so I could control it from either place without worrying about keeping one or the other at full volume, unlike with the Jambox, which had its own independent volume level. It served me well.</p>
    <p>But over the years, I found myself wishing it had more bass. Granted, for a speaker of its size, it was fantastically rich and well-balanced, thanks to its <a href="https://en.wikipedia.org/wiki/Passive_radiator_(speaker)" target="_blank">passive radiators</a>. But unfortunately, being good for its size did not mean it was good enough to be my main home audio speaker. In the ensuing four years, I’d moved to New York, gotten an apartment of my own, and frankly, I had a lot more income. For the amount of bass-heavy music I was listening to, I needed a speaker that could actually reproduce it.</p>
    <p>Find out what the next speaker was in the next post in this series. Subscribe to this site’s <a href="/rss" target="_blank">RSS feed</a> to stay tuned.</p>
`

const essayBodySanitized = `<p>
      This is part 3 of a series of posts on the evolution of my home audio setup. <a href="https://www.processthings.com/post/672939380171833344/home-audio-evolution-part-2-jawbone-jambox" target="_blank">Read part 2</a>, or <a href="https://www.processthings.com/post/672129007790292992/home-audio-evolution-part-1-sony-phc-z10" target="_blank">start from the beginning</a>.</p>
    <p>In 2013, I got fed up with struggling to hear the underpowered Jambox in my car, and I sprung for a <a href="https://en.wikipedia.org/wiki/UE_Boom" target="_blank">UE Boom</a> in blue, white, and yellow.</p>
    <figure class="third right captioned" data-orig-height="1200" data-orig-width="600"><img src="../../media/673954189579288576_0.png" alt="" data-orig-height="1200" data-orig-width="600"><figcaption>The original UE Boom.</figcaption></figure><p>This thing was great. I did a little research online, as well as some in-person tests at the local big box store. The Boom was the only compact Bluetooth speaker that could compete with the cacophony of other shoppers doing their tests, which sounded about as loud as typical road noise, if not louder. And indeed, when I jammed it between my windshield and dashboard, it was quite loud enough without even approaching full volume. Even better, it was able to link its volume controls between itself and the source device, so I could control it from either place without worrying about keeping one or the other at full volume, unlike with the Jambox, which had its own independent volume level. It served me well.</p>
    <p>But over the years, I found myself wishing it had more bass. Granted, for a speaker of its size, it was fantastically rich and well-balanced, thanks to its <a href="https://en.wikipedia.org/wiki/Passive_radiator_(speaker)" target="_blank">passive radiators</a>. But unfortunately, being good for its size did not mean it was good enough to be my main home audio speaker. In the ensuing four years, I’d moved to New York, gotten an apartment of my own, and frankly, I had a lot more income. For the amount of bass-heavy music I was listening to, I needed a speaker that could actually reproduce it.</p>
    <p>Find out what the next speaker was in the next post in this series. Subscribe to this site’s <a href="/rss" target="_blank">RSS feed</a> to stay tuned.</p>`

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

const photoTitle = 'premium goods'

const photoBodyOriginal = `<figure class="tmblr-full" data-orig-height="1023" data-orig-width="1243"><img src="https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s640x960/fd76b2161a22a9e8b27fc08ef4f79015e506a106.jpg" data-orig-height="1023" data-orig-width="1243" srcset="https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s75x75_c1/ca64c57d82a4a1f707becd76c4818556931f32fb.jpg 75w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s100x200/c62e1e0ea262bd6966f5794af5e108a86e36bdc7.jpg 100w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s250x400/e8f7be0acf534024b12fc08c50ebc5399bc06720.jpg 250w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s400x600/b5083c246c50622bb93c63302d7b5a90046bb8d5.jpg 400w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s500x750/ce6437879990e41ae6338f37b2ca0c7524314e6c.jpg 500w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s540x810/e352357f8d686aaf4cf5f88f4e549c22f5f66293.jpg 540w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s640x960/fd76b2161a22a9e8b27fc08ef4f79015e506a106.jpg 640w, https://64.media.tumblr.com/476f77e40014b0d7e3c5fa3fb8049713/7f1eac782e8e6fde-da/s1280x1920/4fa2414a08b0f19648c8e7e6c7c9cacb5267f2c8.jpg 1243w" sizes="(max-width: 1243px) 100vw, 1243px"></figure>`

const photoBodySanitized = `<figure class="tmblr-full" data-orig-height="1023" data-orig-width="1243"><img src="../../media/190376479142_0.jpg" data-orig-height=\"1023\" data-orig-width=\"1243\"></figure>`

const photoPubDateString = "January 20th, 2020 10:23pm"
const photoPubDate = moment(photoPubDateString, "MMMM Do, YYYY h:mma").toDate()

const photoTagsWithoutCollection = [
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

const photoTags: Tag[] = [
	{
		name: "drawing",
		slug: "drawing"
	},
	...photoTagsWithoutCollection
]

const photoTagHtmlFragments = photoTags.map(tagHtmlFragment)

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
		${essayBodyOriginal}
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
		<div class="npf_row">${photoBodyOriginal}</div><p class="npf_chat">${photoTitle}</p>
		<div id="footer">
			<span id="timestamp"> ${photoPubDateString} </span>
${photoTagHtmlFragments}
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
	body: `${essayBodySanitized}`,
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
	article: essayArticle,

	tags: essayTags,
	collection: essayCollection,

	redirect: essayRedirect
}

const drawingCollection = {
	name: "Drawing",
	slug: "drawing"
}

const drawingArticle = {
	title: photoTitle,
	body: `${photoBodySanitized}`,
	createdAt: photoPubDate,
	publishedAt: photoPubDate,
	updatedAt: photoPubDate,
	slug: 'premium-goods',
	author: "elle mundy",
	og_type: "article",
}

const drawingRedirect = {
	from: "/post/190376479142/premium-goods",
	httpCode: 301
}

const drawingDatumContainer: DatumContainer = {
	article: drawingArticle,

	tags: photoTagsWithoutCollection,

	collection: drawingCollection,

	redirect: drawingRedirect
}
