/* eslint-disable @typescript-eslint/no-require-imports */
// @ts-check

/**
 * @type {import("helpertypes").PartialDeep<import("sandhog").SandhogConfig>}
 */
const config = {
	...require("@wessberg/ts-config/sandhog.config.json"),
	logo: {
		url: "https://raw.githubusercontent.com/wessberg/nodefactory/master/documentation/asset/logo.png",
		height: 80
	},
	readme: {
		sections: {
			exclude: ["faq"]
		}
	}
};
module.exports = config;
