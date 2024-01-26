// only so i can fricken stub fs lmao

import * as fs from "fs";

export default class FsProxy {
	readFileSync = (path: fs.PathLike) =>
		fs.readFileSync(path)
	readdirSync = (path: fs.PathLike) =>
		fs.readdirSync(path)
  existsSync = (path: fs.PathLike) =>
		fs.existsSync(path)
}
