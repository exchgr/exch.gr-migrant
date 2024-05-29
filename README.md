# exch.gr-migrant

## What it is
exch.gr-migrant is a command line tool written in TypeScript that migrates older blogs to the blog at https://exch.gr/. It supports importing Tumblr and Squarespace blog archives and exporting to the Strapi API. It also supports migrating images using the [Strapi upload plugin](https://docs.strapi.io/dev-docs/plugins/upload), which will upload it to whatever asset host you have configured.

## Contributing
⚠️ This is not a general purpose migration tool. It is specific to the data schema for exch.gr, but it's written so that you, reader, can fork the repo and adapt it to your own blog's needs. I will not be accepting pull requests or responding to issues.

That said, the data schema here is fairly generalized. You could conceivably set up a Strapi server with the same data schema and use it for your own needs unmodified. You might still need to adapt some aspects of the importers, such as various types of image galleries on Squarespace, or Tumblr post types other than text and images.

## Setup
1. Install node 20.12.2 or later.
2. Install yarn.
3. Run `yarn` to install dependencies.

## Development
The following information is meant to assist you in forking this repo and adapting it for your own blog's needs.

### entrypoint.ts
This is the file where execution truly starts. It provides the `main` function with any factories it needs to construct instances during runtime. This separation from `main` is so we can unit test `main` with stubs and still be able to do things like construct instances based on user input on the command line, such as an API token that doesn't belong in bash history, stored in plaintext.

### main.ts
This is where all dependencies are [tied](https://www.infoq.com/presentations/Simple-Made-Easy/) together and orchestrated. This function constructs and calls importers, the exporter, asset migrators, and the data container collater.

### types/
This directory contains type definitions for data structures used in Strapi, as well as data containers and a utility type for importing Tumblr posts. The Strapi types (`Article`, `Collection`, `Redirect`, and `Tag`) map 1:1 to content-types and their fields created in the [Content-Type Builder](https://docs.strapi.io/user-docs/content-type-builder). `Entity` is the shape of a response from the Strapi API, and it wraps around these types. For convenience, there are also `Table` and `Attributes` union types that unify (unionize?) all the Strapi-related types. `Connection` provides a way to associate them. See how they're used in `StrapiExporter` for more details. `DatumContainer` and `DataContainer` are used at various stages during import and before export to hold collections and associations of data.

### importers/
The functions in Importers, such as `importSquarespace` and `importTumblr`, do what they say on the tin. If you're migrating from a different blog platform, you must write an Importer for it and put it in this directory. Then, you can call it from `main`. Importers each return an array of `DatumContainer`, which each contain an article and its associated tags, collection, and redirect.

These (and other) files also contain various would-be `private` functions, which are exported but have an underscore in front of their names. This is only so they can be unit tested, but they shouldn't be used by anything else outside the file.

### DataContainerCollater.ts
The function `collateDataContainer` takes an array of `DatumContainer` returned by Importers and collates them into a single unified `DatumContainer`. In the process, it ensures tags and collections are unique, and it associates articles with their tags, collections, and redirects. This puts it in a format that's easy for an exporter to use.

### exporters/
The class `StrapiExporter` takes articles, tags, etc. that have been imported and collated into a `DataContainer`, and it exports them to Strapi. The data and associations in `DataContainer` map cleanly to the Strapi API. If you would like to export to a different platform, you must adapt this schema to your needs.

### assetMigrators/
This directory handles migrating assets, mainly images. The platform-specific asset migrators in this directory each take into account various archives' ways of including images. They all implement `AssetMigrator`, which ensures a common interface. 

For Squarespace, `SquarespaceAssetMigrator` downloads images from Squarespace's servers, uploads them to Strapi, and replaces the `img` elements in markup. 

For Tumblr, `TumblrImporter` replaces erroneous markup that refers to lower-quality, tumblr-hosted images with the original local copies provided in the archive. Then, `TumblrAssetMigrator` uploads the images to Strapi.

Both of these asset migrators use an instance of the common `AssetUploader` class, which knows how to upload images to Strapi.

### lib/
This directory contains various utility functions, command line argument validation, and a utility to read tumblr posts into a format that `TumblrImporter` can understand.

## Command Line Usage
```
Usage:
yarn run migrate [options]

Options:
-h
    Print this help message

Importers:
NOTE: At least one importer is required.

-s, --squarespace [filename]
    Specify the squarespace export XML file

-t, --tumblr [directory]
    Specify the tumblr export directory where html files live, including
    the /posts/html subdirectory.

-r, --strapi [url]
    Specify the URL of your strapi server, including protocol, hostname, and
    (optionally) port.

-c, --cacheDirectory [directory]
    Specify the directory where assets will be cached when migrating from Tumblr.
```
