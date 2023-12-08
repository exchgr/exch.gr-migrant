import Strapi from "strapi-sdk-js"
import {StrapiExporter} from "StrapiExporter"

export type StrapiExporterFactory = (strapi: Strapi) => StrapiExporter

export const buildStrapiExporter: StrapiExporterFactory = (strapi: Strapi) =>
	new StrapiExporter(strapi)
