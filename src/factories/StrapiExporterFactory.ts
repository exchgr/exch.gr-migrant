import {StrapiExporter} from "../exporters/StrapiExporter"

export type StrapiExporterFactory = (strapiUrl: string,
	strapiToken: string,
) => StrapiExporter

export const buildStrapiExporter: StrapiExporterFactory = (
	strapiUrl: string,
	strapiToken: string,
) =>
	new StrapiExporter(strapiUrl, strapiToken)
