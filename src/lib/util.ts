export const partition = <T>(array: T[], predicate: (element: T) => boolean) => (
	array.reduce((accumulator: [T[], T[]], element: T) => (
		accumulator[predicate(element) ? 0 : 1].push(element), accumulator
	), [[], []])
)

export const promiseSequence = async <T>(promises: Promise<T>[]): Promise<T[]> => {
	const keptPromises = []

	for (const promise of promises) {
		keptPromises.push(await promise)
	}

	return keptPromises
}
