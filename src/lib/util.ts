export const partition = <T>(array: T[], predicate: (element: T) => boolean) => (
	array.reduce((accumulator: [T[], T[]], element: T) => (
		accumulator[predicate(element) ? 0 : 1].push(element), accumulator
	), [[], []])
)

export const syncMap = async <T, U>(array: T[], func: (arg: T) => Promise<U>): Promise<U[]> => {
	const results: U[] = []

	for (const t of array) {
		results.push(await func(t))
	}

	return results
}

export const titleize = (string: string): string =>
	string.replace(
		/\b\w+/g,
		function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
		}
	)

export const objectToFormData = (
	object: {[key: string]: {file: Blob, filename: string}}
): FormData => {
	const formData = new FormData()
	for (const key in object) {
		formData.append(key, object[key].file, object[key].filename)
	}
	return formData
}
