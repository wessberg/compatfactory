import shared from "@wessberg/ts-config/eslint.config.js";

export default [
	...shared,
	{
		rules: {
			"@typescript-eslint/no-unnecessary-condition": "off",
			"@typescript-eslint/no-deprecated": "off",
			"@typescript-eslint/consistent-type-imports": "off",
			"@typescript-eslint/no-unnecessary-type-assertion": "off",
			"@typescript-eslint/naming-convention": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-unsafe-enum-comparison": "off"
		}
	}
];
