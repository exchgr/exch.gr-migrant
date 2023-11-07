import {main} from "main";
import SquarespaceImporter from "SquarespaceImporter";
import * as fs from "fs";

const squarespaceImporter = new SquarespaceImporter()

main(process.argv, fs, squarespaceImporter)
