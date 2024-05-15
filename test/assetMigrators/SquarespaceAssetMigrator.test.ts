import {JSDOM} from "jsdom"
import {expect} from "chai"
import {
	_renderGridGalleryItem,
	_renderStackedGalleryItem,
	SquarespaceAssetMigrator
} from "../../src/assetMigrators/SquarespaceAssetMigrator"
import {syncMap} from "../../src/lib/util"
import {Article} from "../../src/types/Article"
import {createStubInstance, restore, stub} from "sinon"
import {AssetUploader} from "../../src/assetMigrators/AssetUploader"
import fs from "fs"

describe("SquarespaceAssetMigrator", () => {
	const strapiUrl = "http://localhost:1337"
	const strapiToken = "apiToken"
	const stackedImgFilename = "hoa+2022-07-23-1.jpg"

	const stackedImgSrc = `https://images.squarespace-cdn.com/content/v1/60de1fd01dfb800542323787/1672611472922-K36P4V3NZV47SLX5Z94A/${stackedImgFilename}`

	const oldHoaImg = `<img src=${stackedImgSrc} alt="hoa 2022-07-23-1.jpg">`

	const newHoaImgUrl = "https://imagedelivery.net/fakeHash_hoa+2022-07-23-1/public"

	const newHoaImg = `<img src="${newHoaImgUrl}" alt="hoa 2022-07-23-1.jpg">`

	const gridImgFilename = "deleteme-1.jpg"

	const gridImgSrc =`https://images.squarespace-cdn.com/content/v1/60de1fd01dfb800542323787/1672693567243-T72FI7KI2MHEARQJQMX7/${gridImgFilename}`

	const oldEyeOfSauronImg = `<img src="${gridImgSrc}" alt="Eye of Sauron">`

	const newEyeOfSauronUrl = "https://imagedelivery.net/fakeHash_deleteme-1/public"

	const newEyeOfSauronImg = `<img src="${newEyeOfSauronUrl}" alt="Eye of Sauron">`

	afterEach(restore)

	describe("migrateAssets", () => {
		it("should migrate assets to strapi", async () => {
			const cacheDir = "/Users/test/cacheDir/"

			const pubDate = new Date("Mon, 02 Jan 2023 01:08:58 +0000")
			const pubDate2 = new Date("Mon, 03 Jan 2023 01:08:58 +0000")

			const stackedArticle: Article = {
				title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
				body: `<body><div class="sqs-gallery-container sqs-gallery-block-stacked sqs-gallery-block-show-meta block-animation-none clear">
  <div class="sqs-gallery">
		<div class="image-wrapper" id="63b2069002d97a0c49593f4d" data-type="image" data-animation-role="image">
			<noscript>
				${oldHoaImg}
			</noscript>
			<img class="thumb-image" src="https://images.squarespace-cdn.com/content/v1/60de1fd01dfb800542323787/1672611472922-K36P4V3NZV47SLX5Z94A/hoa+2022-07-23-1.jpg" data-image="https://images.squarespace-cdn.com/content/v1/60de1fd01dfb800542323787/1672611472922-K36P4V3NZV47SLX5Z94A/hoa+2022-07-23-1.jpg" data-image-dimensions="853x1280" data-image-focal-point="0.5,0.5" alt="hoa 2022-07-23-1.jpg" data-load="false" data-image-id="63b2069002d97a0c49593f4d" data-type="image" />
		</div>
	</div>
</div></body>`,
				createdAt: pubDate,
				publishedAt: pubDate,
				updatedAt: pubDate,
				slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
				author: "elle mundy",
				og_type: "article"
			}

			const gridArticle: Article = {
				title: "Another post",
				body: `<body><div class="sqs-gallery-container sqs-gallery-block-grid sqs-gallery-aspect-ratio-square sqs-gallery-thumbnails-per-row-3 sqs-gallery-block-show-meta sqs-gallery-block-meta-position-bottom sqs-gallery-block-meta-hover sqs-gallery-block-show-meta sqs-gallery-transparent-background block-animation-none clear">
  <div class="sqs-gallery">
		<div class="slide" data-type="image" data-animation-role="image">
			<div class="margin-wrapper">
				<a data-title="Eye of Sauron" data-description="&lt;p class=&quot;&quot; style=&quot;white-space:pre-wrap;&quot;&gt;Looking down Fulton St. from Cumberland St. at the new skyscrapers in Downtown Brooklyn&lt;/p&gt;" data-lightbox-theme="dark" href="https://images.squarespace-cdn.com/content/v1/60de1fd01dfb800542323787/1672693567243-T72FI7KI2MHEARQJQMX7/deleteme-1.jpg" role="button" class=" image-slide-anchor js-gallery-lightbox-opener content-fit ">
					<span class="v6-visually-hidden">View fullsize</span>
					<noscript>
						${oldEyeOfSauronImg}
					</noscript>
					<img class="thumb-image" src="https://images.squarespace-cdn.com/content/v1/60de1fd01dfb800542323787/1672693567243-T72FI7KI2MHEARQJQMX7/deleteme-1.jpg" data-image="https://images.squarespace-cdn.com/content/v1/60de1fd01dfb800542323787/1672693567243-T72FI7KI2MHEARQJQMX7/deleteme-1.jpg" data-image-dimensions="853x1280" data-image-focal-point="0.5049426020408163,0.48299319727891155" alt="Eye of Sauron" data-load="false" data-image-id="63b3473e3294e244b7ddc0c9" data-type="image" />
				</a>
			</div>
		</div>
	</div>
</div></body>`,
				createdAt: pubDate2,
				publishedAt: pubDate2,
				updatedAt: pubDate2,
				slug: "another-post-2023-12-22",
				author: "elle mundy",
				og_type: "article",
			}

			const articles = [
				stackedArticle,
				gridArticle
			]

			const cachedHoaFilename =
				`file://${cacheDir}${stackedImgFilename}`

			const cachedEyeOfSauronFilename = `file://${cacheDir}${gridImgFilename}`

			const assetsMigratedArticles: Article[] = [{
				title: "Rethinking Social Media in 2023: A New Home for my Photos // House of Abundance: Stoop Edition",
				body: `<body><div class="grid-gallery">
	<a href="${newHoaImgUrl}">${newHoaImg}</a>
</div></body>`,
				createdAt: pubDate,
				publishedAt: pubDate,
				updatedAt: pubDate,
				slug: "rethinking-social-media-in-2023-a-new-home-for-my-photos-house-of-abundance-2022-07-23",
				author: "elle mundy",
				og_type: "article"
			}, {
				title: "Another post",
				body: `<body><div class="grid-gallery">
	<figure>
	<a href="${newEyeOfSauronUrl}">
		${newEyeOfSauronImg}
	</a>
	<figcaption>Eye of Sauron</figcaption>
</figure>
</div></body>`,
				createdAt: pubDate2,
				publishedAt: pubDate2,
				updatedAt: pubDate2,
				slug: "another-post-2023-12-22",
				author: "elle mundy",
				og_type: "article",
			}]

			const assetUploader = new AssetUploader(strapiUrl, strapiToken)

			stub(assetUploader, "uploadAsset")
				.withArgs(cachedHoaFilename).resolves(newHoaImgUrl)
				.withArgs(cachedEyeOfSauronFilename).resolves(newEyeOfSauronUrl)

			const squarespaceAssetMigrator =
				new SquarespaceAssetMigrator(cacheDir, assetUploader)

			stub(squarespaceAssetMigrator, "_downloadAsset")
				.withArgs(stackedImgSrc).resolves(cachedHoaFilename)
				.withArgs(gridImgSrc).resolves(cachedEyeOfSauronFilename)

			stub(fs, "unlinkSync")
				.withArgs(cachedHoaFilename).returns(undefined)
				.withArgs(cachedEyeOfSauronFilename).returns(undefined)

			expect(
				await syncMap(articles, squarespaceAssetMigrator.migrateAssets)
			).to.deep.eq(assetsMigratedArticles)
		})
	})

	describe("_replaceGalleries", () => {
		it(
			"should download and upload assets, and replace galleries with new markup",
			async () => {
				const document = new JSDOM(
					`<body><div class="sqs-gallery-container sqs-gallery-block-stacked sqs-gallery-block-show-meta block-animation-none clear">
  <div class="sqs-gallery">
		<div class="image-wrapper" id="63b2069002d97a0c49593f4d" data-type="image" data-animation-role="image">
			<noscript>
				${oldHoaImg}
			</noscript>
			<img class="thumb-image" src="https://images.squarespace-cdn.com/content/v1/60de1fd01dfb800542323787/1672611472922-K36P4V3NZV47SLX5Z94A/hoa+2022-07-23-1.jpg" data-image="https://images.squarespace-cdn.com/content/v1/60de1fd01dfb800542323787/1672611472922-K36P4V3NZV47SLX5Z94A/hoa+2022-07-23-1.jpg" data-image-dimensions="853x1280" data-image-focal-point="0.5,0.5" alt="hoa 2022-07-23-1.jpg" data-load="false" data-image-id="63b2069002d97a0c49593f4d" data-type="image" />
		</div>
	</div>
</div></body>`,
					{
						contentType: "text/html",
						url: "https://imagedelivery.net/"
					}
				).window.document

				const cacheDir = "/Users/test/cacheDir/"
				const assetUploader = new AssetUploader(strapiUrl, strapiToken)
				const filename = "hoa+2022-07-23-1.jpg"
				const cachedPath = `${cacheDir}${filename}`

				stub(assetUploader, "uploadAsset")
					.withArgs(cachedPath)
					.resolves(newHoaImgUrl)

				const squarespaceAssetMigrator =
					new SquarespaceAssetMigrator(cacheDir, assetUploader)

				stub(squarespaceAssetMigrator, "_downloadAsset")
					.withArgs(stackedImgSrc).resolves(cachedPath)

				stub(fs, "unlinkSync")
					.withArgs(cachedPath).returns(undefined)

				const galleryClass = "grid-gallery"

				await squarespaceAssetMigrator._replaceGalleries(
					document.body,
					".sqs-gallery-block-stacked",
					galleryClass,
					_renderStackedGalleryItem
				)

				// It's necessary to re-query because "Also, while the element will be
				// replaced in the document, the variable whose outerHTML property
				// was set will still hold a reference to the original element."
				// (https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML)
				expect(document.querySelector("body")!.innerHTML).to.eq(
					`<div class="${galleryClass}">
	<a href="${newHoaImgUrl}">${newHoaImg}</a>
</div>`
				)
			}
		)
	})

	describe("_downloadAsset", () => {
		it(
			"should download an asset, store it in cacheDir, and return the filename",
			async () => {
				const cacheDir = "/Users/test/cacheDir/"
				const filename = "hoa+2022-07-23-1.jpg"
				const cachedPath = `${cacheDir}${filename}`

				const squarespaceImgUrl =
					`https://images.squarespace-cdn.com/content/v1/60de1fd01dfb800542323787/1672611472922-K36P4V3NZV47SLX5Z94A/${filename}`

				const data = "data"

				stub(fs, "writeFileSync")
					.withArgs(cachedPath, data)

				const response = createStubInstance(Response)

				global.fetch = stub()
					.withArgs(squarespaceImgUrl).resolves(response)

				response.arrayBuffer.resolves(new TextEncoder().encode(JSON.stringify({data})).buffer)

				const assetUploader = new AssetUploader(strapiUrl, strapiToken)

				const squarespaceAssetMigrator = new SquarespaceAssetMigrator(cacheDir, assetUploader)

				expect(await squarespaceAssetMigrator._downloadAsset(
				squarespaceImgUrl
				)).to.eq(cachedPath)
			}
		)
	})

	describe("_renderStackedGalleryItem", () => {
		it("should replace a stacked gallery with imgs", () => {
			const imgElement: HTMLImageElement = new JSDOM(
				newHoaImg,
				{
					contentType: "text/html",
					url: "https://imagedelivery.net/"
				}
			).window.document.querySelector("img")!

			expect(_renderStackedGalleryItem(imgElement)).to.eq(
				`<a href="${newHoaImgUrl}">${newHoaImg}</a>`
			)
		})
	})

	describe("_renderGridGalleryItem", () => {
		it("should replace a grid gallery with figures", () => {
			const imgElement: HTMLImageElement = new JSDOM(
				newEyeOfSauronImg,
				{
					contentType: "text/html",
					url: "https://imagedelivery.net/"
				}
			).window.document.querySelector("img")!

			expect(_renderGridGalleryItem(imgElement)).to.eq(`<figure>
	<a href="${newEyeOfSauronUrl}">
		${newEyeOfSauronImg}
	</a>
	<figcaption>Eye of Sauron</figcaption>
</figure>`)
		})
	})
})
