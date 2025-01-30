<h1 align="center">package.json validator</h1>

<p align="center">Tools to validate <code>package.json</code> files.</p>

<p align="center">
	<a href="https://github.com/JoshuaKGoldberg/package-json-validator/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://github.com/JoshuaKGoldberg/package-json-validator/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
	<a href="http://npmjs.com/package/package-json-validator"><img alt="📦 npm version" src="https://img.shields.io/npm/v/package-json-validator?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
</p>

## Supported Specifications

Of course, there are multiple ones to follow, which makes it trickier.

- [NPM](https://docs.npmjs.com/cli/configuring-npm/package-json)
- [CommonJS Packages 1.0](http://wiki.commonjs.org/wiki/Packages/1.0)
- [CommonJS Packages 1.1](http://wiki.commonjs.org/wiki/Packages/1.1)

## Usage

### Command line

```shell
npm install package-json-validator -g
```

See `pjv --help` for usage:

```plaintext
Options:
  --filename, -f         package.json file to validate                      [default: "package.json"]
  --spec, -s             which spec to use - npm|commonjs_1.0|commonjs_1.1  [default: "npm"]
  --warnings, -w         display warnings                                   [default: false]
  --recommendations, -r  display recommendations                            [default: false]
  --quiet, -q            less output                                        [default: false]
  --help, -h, -?         this help message                                  [default: false]
```

### Node.js

```shell
npm install package-json-validator
```

```js
import { validate } from "package-json-validator";

validate(/* ... */);
```

## API

```js
validate(packageData[([, spec], options)]);
```

`spec` is either `npm`, `commonjs_1.0`, or `commonjs_1.1`

`options` is an object with the following available:

```js
{
    warnings: true, // show warnings
    recommendations: true // show recommendations
}
```

Example using an object:

```js
const { validate } = require("package-json-validator");

const packageData = {
	name: "my-package",
	version: "1.2.3",
};

validate(packageData);
```

Example using a string:

```js
const { validate } = require("package-json-validator");

const text = JSON.stringify({
	name: "packageJsonValidator",
	version: "0.1.0",
	private: true,
	dependencies: {
		"date-fns": "^2.29.3",
		install: "^0.13.0",
		react: "^18.2.0",
		"react-chartjs-2": "^5.0.1",
		"react-dom": "^18.2.0",
		"react-material-ui-carousel": "^3.4.2",
		"react-multi-carousel": "^2.8.2",
		"react-redux": "^8.0.5",
		"react-router-dom": "^6.4.3",
		"react-scripts": "5.0.1",
		redux: "^4.2.0",
		"styled-components": "^5.3.6",
		"web-vitals": "^2.1.4",
	},
	scripts: {
		start: "react-scripts start",
	},
	eslintConfig: {
		extends: ["react-app", "react-app/jest"],
	},
	browserslist: {
		production: [">0.2%", "not dead", "not op_mini all"],
		development: [
			"last 1 chrome version",
			"last 1 firefox version",
			"last 1 safari version",
		],
	},
});

const data = validate(text);
```

Output for above example:

```js
console.log(data);
// {
//  valid: true,
//   warnings: [
//    'Missing recommended field: description',
//    'Missing recommended field: keywords',
//    'Missing recommended field: bugs',
//    'Missing recommended field: licenses',
//    'Missing recommended field: author',
//    'Missing recommended field: contributors',
//    'Missing recommended field: repository'
//  ],
//  recommendations: [
//    'Missing optional field: homepage',
//    'Missing optional field: engines'
//  ]
}
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://alan.norbauer.com/"><img src="https://avatars.githubusercontent.com/u/1009?v=4?s=100" width="100px;" alt="Alan"/><br /><sub><b>Alan</b></sub></a><br /><a href="#ideas-altano" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://amilajack.com/"><img src="https://avatars.githubusercontent.com/u/6374832?v=4?s=100" width="100px;" alt="Amila Welihinda"/><br /><sub><b>Amila Welihinda</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=amilajack" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://brekken.com/"><img src="https://avatars.githubusercontent.com/u/843958?v=4?s=100" width="100px;" alt="Andreas Brekken"/><br /><sub><b>Andreas Brekken</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=abrkn" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://gitlab.com/4U6U57"><img src="https://avatars.githubusercontent.com/u/4676561?v=4?s=100" width="100px;" alt="August Valera"/><br /><sub><b>August Valera</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=4U6U57" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://brett-zamir.me/"><img src="https://avatars.githubusercontent.com/u/20234?v=4?s=100" width="100px;" alt="Brett Zamir"/><br /><sub><b>Brett Zamir</b></sub></a><br /><a href="#ideas-brettz9" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.chrismontgomery.info/"><img src="https://avatars.githubusercontent.com/u/232356?v=4?s=100" width="100px;" alt="Chris Montgomery"/><br /><sub><b>Chris Montgomery</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=chmontgomery" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.claycarpenter.us/"><img src="https://avatars.githubusercontent.com/u/550902?v=4?s=100" width="100px;" alt="Clay Carpenter"/><br /><sub><b>Clay Carpenter</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=claycarpenter" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://foobar.social/web/@davglass"><img src="https://avatars.githubusercontent.com/u/32551?v=4?s=100" width="100px;" alt="Dav Glass"/><br /><sub><b>Dav Glass</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=davglass" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://ddy.su"><img src="https://avatars.githubusercontent.com/u/14067329?v=4?s=100" width="100px;" alt="Denis"/><br /><sub><b>Denis</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=de-don" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/DjDCH"><img src="https://avatars.githubusercontent.com/u/1269117?v=4?s=100" width="100px;" alt="DjDCH"/><br /><sub><b>DjDCH</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/issues?q=author%3ADjDCH" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.ericcornelissen.dev/"><img src="https://avatars.githubusercontent.com/u/3742559?v=4?s=100" width="100px;" alt="Eric Cornelissen"/><br /><sub><b>Eric Cornelissen</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/issues?q=author%3Aericcornelissen" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/gtanner"><img src="https://avatars.githubusercontent.com/u/317051?v=4?s=100" width="100px;" alt="Gord Tanner"/><br /><sub><b>Gord Tanner</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=gtanner" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://h3manth.com/"><img src="https://avatars.githubusercontent.com/u/18315?v=4?s=100" width="100px;" alt="Hemanth HM"/><br /><sub><b>Hemanth HM</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=hemanth" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://rob.gant.ninja/"><img src="https://avatars.githubusercontent.com/u/710553?v=4?s=100" width="100px;" alt="J Rob Gant"/><br /><sub><b>J Rob Gant</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/issues?q=author%3Argant" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://staxmanade.com/"><img src="https://avatars.githubusercontent.com/u/156715?v=4?s=100" width="100px;" alt="Jason Jarrett"/><br /><sub><b>Jason Jarrett</b></sub></a><br /><a href="#ideas-staxmanade" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jatin"><img src="https://avatars.githubusercontent.com/u/1121748?v=4?s=100" width="100px;" alt="Jatin Chopra"/><br /><sub><b>Jatin Chopra</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=jatin" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.joshuakgoldberg.com/"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg ✨"/><br /><sub><b>Josh Goldberg ✨</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/issues?q=author%3AJoshuaKGoldberg" title="Bug reports">🐛</a> <a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=JoshuaKGoldberg" title="Documentation">📖</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/anudeep586"><img src="https://avatars.githubusercontent.com/u/61861542?v=4?s=100" width="100px;" alt="L N M Anudeep"/><br /><sub><b>L N M Anudeep</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=anudeep586" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://linus.xn--unnebck-9wa.se/"><img src="https://avatars.githubusercontent.com/u/189580?v=4?s=100" width="100px;" alt="Linus Unnebäck"/><br /><sub><b>Linus Unnebäck</b></sub></a><br /><a href="#maintenance-LinusU" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://holloway.co.nz/"><img src="https://avatars.githubusercontent.com/u/620580?v=4?s=100" width="100px;" alt="Matthew Holloway"/><br /><sub><b>Matthew Holloway</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/issues?q=author%3Aholloway" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TechNickAI"><img src="https://avatars.githubusercontent.com/u/142708?v=4?s=100" width="100px;" alt="Nick Sullivan"/><br /><sub><b>Nick Sullivan</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/issues?q=author%3ATechNickAI" title="Bug reports">🐛</a> <a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=TechNickAI" title="Code">💻</a> <a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=TechNickAI" title="Documentation">📖</a> <a href="#ideas-TechNickAI" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-TechNickAI" title="Maintenance">🚧</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/normful"><img src="https://avatars.githubusercontent.com/u/2453169?v=4?s=100" width="100px;" alt="Norman Sue"/><br /><sub><b>Norman Sue</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/issues?q=author%3Anormful" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://about.me/peterdehaan"><img src="https://avatars.githubusercontent.com/u/557895?v=4?s=100" width="100px;" alt="Peter deHaan"/><br /><sub><b>Peter deHaan</b></sub></a><br /><a href="#ideas-pdehaan" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=pdehaan" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://reggi.com/"><img src="https://avatars.githubusercontent.com/u/296798?v=4?s=100" width="100px;" alt="Reggi"/><br /><sub><b>Reggi</b></sub></a><br /><a href="#ideas-reggi" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://dsebastien.net/"><img src="https://avatars.githubusercontent.com/u/89887?v=4?s=100" width="100px;" alt="Sebastien Dubois"/><br /><sub><b>Sebastien Dubois</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=dsebastien" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.sdealmeida.com/"><img src="https://avatars.githubusercontent.com/u/1103528?v=4?s=100" width="100px;" alt="Simon"/><br /><sub><b>Simon</b></sub></a><br /><a href="#ideas-sdalmeida" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/slavafomin"><img src="https://avatars.githubusercontent.com/u/1702725?v=4?s=100" width="100px;" alt="Slava Fomin II"/><br /><sub><b>Slava Fomin II</b></sub></a><br /><a href="#ideas-slavafomin" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hyoban"><img src="https://avatars.githubusercontent.com/u/38493346?v=4?s=100" width="100px;" alt="Stephen Zhou"/><br /><sub><b>Stephen Zhou</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=hyoban" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/vkrol"><img src="https://avatars.githubusercontent.com/u/153412?v=4?s=100" width="100px;" alt="Veniamin Krol"/><br /><sub><b>Veniamin Krol</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=vkrol" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/gramergrater"><img src="https://avatars.githubusercontent.com/u/9351863?v=4?s=100" width="100px;" alt="gramergrater"/><br /><sub><b>gramergrater</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/issues?q=author%3Agramergrater" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/michaelfaith"><img src="https://avatars.githubusercontent.com/u/8071845?v=4?s=100" width="100px;" alt="michael faith"/><br /><sub><b>michael faith</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=michaelfaith" title="Code">💻</a> <a href="#ideas-michaelfaith" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-michaelfaith" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sarahhagstrom"><img src="https://avatars.githubusercontent.com/u/1223862?v=4?s=100" width="100px;" alt="sarahhagstrom"/><br /><sub><b>sarahhagstrom</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/package-json-validator/commits?author=sarahhagstrom" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Appreciation

Many thanks to [@TechNickAI](https://github.com/TechNickAI) for creating the initial version and core infrastructure of this package! 💖
