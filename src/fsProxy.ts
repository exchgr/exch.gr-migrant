// only so i can fricken stub fs lmao

import * as fs from "fs";

export default class FsProxy {
	readFileSync(filename: string | Buffer | URL | number) {
		return fs.readFileSync(filename)
	}
}
