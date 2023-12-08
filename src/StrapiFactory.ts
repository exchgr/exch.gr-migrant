import Strapi, {StrapiOptions} from "strapi-sdk-js"

export type StrapiFactory = (strapiOptions: StrapiOptions) => Strapi

export const buildStrapi: StrapiFactory = (strapiOptions: StrapiOptions) => (
	new Strapi(strapiOptions)
)
