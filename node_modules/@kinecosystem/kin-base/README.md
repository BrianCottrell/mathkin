# js-kin-base

[![Build Status](https://travis-ci.org/kinecosystem/js-kin-base.svg)](https://travis-ci.org/kinecosystem/js-kin-base)
<!---
 [![Code Climate](https://codeclimate.com/github/kinecosystem/js-kin-base/badges/gpa.svg)](https://codeclimate.com/github/kinecosystem/js-kin-base)
 -->
[![Coverage Status](https://coveralls.io/repos/kinecosystem/js-kin-base/badge.svg?branch=master&service=github)](https://coveralls.io/github/kinecosystem/js-kin-base?branch=master)
<!---
[![Dependency Status](https://david-dm.org/stellar/js-stellar-base.svg)](https://david-dm.org/stellar/js-stellar-base)
-->

The kin-base library is the lowest-level Kin helper library.  It consists of classes
to read, write, hash, and sign the xdr structures that are used in [Kin stellar-core](https://github.com/kinecosystem/stellar-core).
This is an implementation in JavaScript that can be used on either Node.js or web browsers.

* **[API Reference](https://stellar.github.io/js-stellar-base/)**

> **Warning!** Node version of this package is using [`ed25519`](https://www.npmjs.com/package/ed25519) package, a native implementation of [Ed25519](https://ed25519.cr.yp.to/) in Node.js, as an [optional dependency](https://docs.npmjs.com/files/package.json#optionaldependencies). This means that if for any reason installation of this package fails, `kin-base` will fallback to the much slower implementation contained in [`tweetnacl`](https://www.npmjs.com/package/tweetnacl).
>
> If you are using `kin-base` in a browser you can ignore this. However, for production backend deployments you should definitely be using `ed25519`. If `ed25519` is successfully installed and working `KinBase.FastSigning` variable will be equal `true`. Otherwise it will be `false`.

## Quick start

Using npm to include js-kin-base in your own project:
```shell
npm install --save @kinecosystem/kin-base
```

For browsers, [use Bower to install it](#to-use-in-the-browser). It exports a
variable `KinBase`. The example below assumes you have `kin-base.js`
relative to your html file.

```html
<script src="kin-base.js"></script>
<script>console.log(KinBase);</script>
```

## Install

### To use as a module in a Node.js project
1. Install it using npm:

  ```shell
  npm install --save @kinecosystem/kin-base
  ```
2. require/import it in your JavaScript:

  ```js
  var KinBase = require('kin-base');
  ```

### To self host for use in the browser
1. Install it using [bower](http://bower.io):

  ```shell
  bower install kin-base
  ```

2. Include it in the browser:

  ```html
  <script src="./bower_components/kin-base/kin-base.js"></script>
  <script>console.log(KinBase);</script>
  ```

If you don't want to use install Bower, you can copy built JS files from the [bower-js-kin-base repo](https://github.com/kinecosystem/bower-js-kin-base).

<!--
### To use the [cdnjs](https://cdnjs.com/libraries/kin-base) hosted script in the browser
1. Instruct the browser to fetch the library from [cdnjs](https://cdnjs.com/libraries/kin-base), a 3rd party service that hosts js libraries:

  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/kin-base/{version}/kin-base.js"></script>
  <script>console.log(KinBase);</script>
  ```

Note that this method relies using a third party to host the JS library. This may not be entirely secure.
-->

Make sure that you are using the latest version number. They can be found on the [releases page in Github](https://github.com/kinecosystem/js-kin-base/releases).

### To develop and test js-kin-base itself
1. Clone the repo

  ```shell
  git clone https://github.com/kinecosystem/js-kin-base.git
  ```
2. Install dependencies inside js-kin-base folder

  ```shell
  cd js-kin-base
  npm install
  ```

## Usage
For information on how to use js-kin-base, take a look at the docs in the [docs folder](./docs).

## Testing
To run all tests:
```shell
gulp test
```

To run a specific set of tests:
```shell
gulp test:node
gulp test:browser
```

Tests are also run on the [Travis CI js-stellar-base project](https://travis-ci.org/kinecosystem/js-kin-base) automatically.

## Documentation
Documentation for this repo lives inside the [docs folder](./docs).

<!---
## Contributing
Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this project.
-->

## Publishing to npm
```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```
A new version will be published to npm **and** Bower by Travis CI.

npm >=2.13.0 required.
Read more about [npm version](https://docs.npmjs.com/cli/version).

## License
js-kin-base is licensed under an Apache-2.0 license. See the [LICENSE](./LICENSE) file for details.
