import baseConfig from "@wessberg/ts-config/sandhog.config.js";

export default {
	...baseConfig,
	logo: {
		url: "https://raw.githubusercontent.com/wessberg/compatfactory/master/documentation/asset/logo.png",
		height: 70
	},
	readme: {
		sections: {
			exclude: ["faq"]
		}
	}
};
