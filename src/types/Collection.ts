export type Collection = {
	name: string
	slug: string
	articles?: {
		connect?: number[],
		disconnect?: number[],
		set?: number[]
	}
}
