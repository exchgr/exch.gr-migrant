export type Tag = {
	name: string
	slug: string
	articles?: {
		connect?: number[],
		disconnect?: number[],
		set?: number[]
	}
}
