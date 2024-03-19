import {Article} from "types/Article"

export interface AssetMigrator {
	migrateAssets: (articles: Article) => Promise<Article>
}
