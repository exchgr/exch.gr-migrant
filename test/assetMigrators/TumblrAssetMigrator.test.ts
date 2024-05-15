import {TumblrAssetMigrator} from "../../src/assetMigrators/TumblrAssetMigrator"
import {expect} from "chai"
import {stub} from "sinon"
import {Article} from "../../src/types/Article"
import moment from "moment"
import {syncMap} from "../../src/lib/util"
import {AssetUploader} from "../../src/assetMigrators/AssetUploader"
import * as path from "path"

describe("TumblrAssetMigrator", () => {
	describe("migrateAssets", () => {
		it("should migrate assets to strapi", async () => {
			const directory = "/Users/test/tumblr-export/posts/html/"
			const strapiToken = "apiToken"

			const essayPubDateString = "January 20th, 2022 9:40pm"
			const essayPubDate = moment(essayPubDateString, "MMMM Do, YYYY h:mma").toDate()
			const photoPubDateString = "January 20th, 2020 10:23pm"
			const photoPubDate = moment(photoPubDateString, "MMMM Do, YYYY h:mma").toDate()

			const oldEssayImgFilename =
				"../../media/673954189579288576_0.png"
			const oldEssayImg =
				`<img src="${oldEssayImgFilename}" alt="" data-orig-height="1200" data-orig-width="600">`

			const oldDrawingImgFilename =
				"../../media/190376479142_0.jpg"
			const oldDrawingImg =
				`<img src="${oldDrawingImgFilename}" data-orig-height="1023" data-orig-width="1243">`

			const newEssayImgUrl =
				"https://imagedelivery.net/fakeHash_673954189579288576_0/public"
			const newEssayImg =
				`<img src="${newEssayImgUrl}" alt="" data-orig-height="1200" data-orig-width="600">`

			const newDrawingImgUrl =
				"https://imagedelivery.net/fakeHash_190376479142_0/public"
			const newDrawingImg =
				`<img src="${newDrawingImgUrl}" data-orig-height="1023" data-orig-width="1243">`

			const articles: Article[] = [{
				title: "Home Audio Evolution, Part 3: UE Boom",
				body: `<p>
      This is part 3 of a series of posts on the evolution of my home audio setup. <a href="https://www.processthings.com/post/672939380171833344/home-audio-evolution-part-2-jawbone-jambox" target="_blank">Read part 2</a>, or <a href="https://www.processthings.com/post/672129007790292992/home-audio-evolution-part-1-sony-phc-z10" target="_blank">start from the beginning</a>.</p>
    <p>In 2013, I got fed up with struggling to hear the underpowered Jambox in my car, and I sprung for a <a href="https://en.wikipedia.org/wiki/UE_Boom" target="_blank">UE Boom</a> in blue, white, and yellow.</p>
    <figure class="third right captioned" data-orig-height="1200" data-orig-width="600">${oldEssayImg}<figcaption>The original UE Boom.</figcaption></figure><p>This thing was great. I did a little research online, as well as some in-person tests at the local big box store. The Boom was the only compact Bluetooth speaker that could compete with the cacophony of other shoppers doing their tests, which sounded about as loud as typical road noise, if not louder. And indeed, when I jammed it between my windshield and dashboard, it was quite loud enough without even approaching full volume. Even better, it was able to link its volume controls between itself and the source device, so I could control it from either place without worrying about keeping one or the other at full volume, unlike with the Jambox, which had its own independent volume level. It served me well.</p>
    <p>But over the years, I found myself wishing it had more bass. Granted, for a speaker of its size, it was fantastically rich and well-balanced, thanks to its <a href="https://en.wikipedia.org/wiki/Passive_radiator_(speaker)" target="_blank">passive radiators</a>. But unfortunately, being good for its size did not mean it was good enough to be my main home audio speaker. In the ensuing four years, I’d moved to New York, gotten an apartment of my own, and frankly, I had a lot more income. For the amount of bass-heavy music I was listening to, I needed a speaker that could actually reproduce it.</p>
    <p>Find out what the next speaker was in the next post in this series. Subscribe to this site’s <a href="/rss" target="_blank">RSS feed</a> to stay tuned.</p>`,
				createdAt: essayPubDate,
				publishedAt: essayPubDate,
				updatedAt: essayPubDate,
				slug: "home-audio-evolution-part-3-ue-boom",
				author: "elle mundy",
				og_type: "article",
			},
			{
				title: 'premium goods',
				body: `<figure class="tmblr-full" data-orig-height="1023" data-orig-width="1243">${oldDrawingImg}</figure>`,
				createdAt: photoPubDate,
				publishedAt: photoPubDate,
				updatedAt: photoPubDate,
				slug: 'premium-goods',
				author: "elle mundy",
				og_type: "article",
			}]

			const assetsMigratedArticles: Article[] = [{
				title: "Home Audio Evolution, Part 3: UE Boom",
				body: `<p>
      This is part 3 of a series of posts on the evolution of my home audio setup. <a href="https://www.processthings.com/post/672939380171833344/home-audio-evolution-part-2-jawbone-jambox" target="_blank">Read part 2</a>, or <a href="https://www.processthings.com/post/672129007790292992/home-audio-evolution-part-1-sony-phc-z10" target="_blank">start from the beginning</a>.</p>
    <p>In 2013, I got fed up with struggling to hear the underpowered Jambox in my car, and I sprung for a <a href="https://en.wikipedia.org/wiki/UE_Boom" target="_blank">UE Boom</a> in blue, white, and yellow.</p>
    <figure class="third right captioned" data-orig-height="1200" data-orig-width="600">${newEssayImg}<figcaption>The original UE Boom.</figcaption></figure><p>This thing was great. I did a little research online, as well as some in-person tests at the local big box store. The Boom was the only compact Bluetooth speaker that could compete with the cacophony of other shoppers doing their tests, which sounded about as loud as typical road noise, if not louder. And indeed, when I jammed it between my windshield and dashboard, it was quite loud enough without even approaching full volume. Even better, it was able to link its volume controls between itself and the source device, so I could control it from either place without worrying about keeping one or the other at full volume, unlike with the Jambox, which had its own independent volume level. It served me well.</p>
    <p>But over the years, I found myself wishing it had more bass. Granted, for a speaker of its size, it was fantastically rich and well-balanced, thanks to its <a href="https://en.wikipedia.org/wiki/Passive_radiator_(speaker)" target="_blank">passive radiators</a>. But unfortunately, being good for its size did not mean it was good enough to be my main home audio speaker. In the ensuing four years, I’d moved to New York, gotten an apartment of my own, and frankly, I had a lot more income. For the amount of bass-heavy music I was listening to, I needed a speaker that could actually reproduce it.</p>
    <p>Find out what the next speaker was in the next post in this series. Subscribe to this site’s <a href="/rss" target="_blank">RSS feed</a> to stay tuned.</p>`,
				createdAt: essayPubDate,
				publishedAt: essayPubDate,
				updatedAt: essayPubDate,
				slug: "home-audio-evolution-part-3-ue-boom",
				author: "elle mundy",
				og_type: "article",
			},
			{
				title: 'premium goods',
				body: `<figure class="tmblr-full" data-orig-height="1023" data-orig-width="1243">${newDrawingImg}</figure>`,
				createdAt: photoPubDate,
				publishedAt: photoPubDate,
				updatedAt: photoPubDate,
				slug: 'premium-goods',
				author: "elle mundy",
				og_type: "article",
			}]

			const [
				oldEssayImgAbsoluteFilename,
				oldDrawingImgAbsoluteFilename
			] = [
				oldEssayImgFilename,
				oldDrawingImgFilename
			].map((filename) => (
				`file://${path.join(directory, filename)}`
			))

			const strapiUrl = "http://localhost:1337"

			const assetUploader = new AssetUploader(
				strapiUrl,
				strapiToken
			)

			stub(assetUploader, "uploadAsset")
				.withArgs(oldEssayImgAbsoluteFilename).resolves(newEssayImgUrl)
				.withArgs(oldDrawingImgAbsoluteFilename).resolves(newDrawingImgUrl)

			const tumblrAssetMigrator = new TumblrAssetMigrator(directory, assetUploader)

			expect(
				await syncMap(articles, tumblrAssetMigrator.migrateAssets)
			).to.deep.eq(assetsMigratedArticles)
		})
	})
})
