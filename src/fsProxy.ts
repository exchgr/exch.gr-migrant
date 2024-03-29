// only so i can fricken stub fs lmao

import * as fs from "fs";
import {Dirent} from "fs"

export default class FsProxy {
	readFileSync = (path: fs.PathLike) => fs.readFileSync(path)

	readdirSync = (path: fs.PathLike, options?: any): string[] => fs.readdirSync(
		path,
		options
	)

	readdirSyncWithFileTypes = (
		path: fs.PathLike,
		options?: { withFileTypes?: true }
	): Dirent[] => fs.readdirSync(path, {...options, withFileTypes: true})

  existsSync = (path: fs.PathLike) => fs.existsSync(path)
	openAsBlob = (path: fs.PathLike) => fs.openAsBlob(path)

	writeFileSync = (
		path: fs.PathLike,
		data: string |
			Uint8Array |
			Uint8ClampedArray |
			Uint16Array |
			Uint32Array |
			Int8Array |
			Int16Array |
			Int32Array |
			BigUint64Array |
			BigInt64Array |
			Float32Array |
			Float64Array |
			DataView
	) => fs.writeFileSync(path, data)

	unlinkSync = (path: fs.PathLike) => fs.unlinkSync(path)
}
