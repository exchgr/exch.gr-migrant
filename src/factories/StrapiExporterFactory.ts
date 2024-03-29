import {StrapiExporter} from "../exporters/StrapiExporter"

export type StrapiExporterFactory = (
	fetche: typeof fetch,
	strapiUrl: string,
	strapiToken: string,
) => StrapiExporter

export const buildStrapiExporter: StrapiExporterFactory = (
	fetche: typeof fetch,
	strapiUrl: string,
	strapiToken: string,
) =>
	new StrapiExporter(fetche, strapiUrl, strapiToken)
