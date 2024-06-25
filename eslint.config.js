// @ts-check

import eslint from "@eslint/js";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    // @ts-ignore
    {
      languageOptions: {
        parserOptions: {
          project: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
    {
      ignores: [
        "tsup.config.ts",
        "dist/",
        "eslint.config.js",
        ".tsup/",
        "jest.config.js",
        "examples/",
        "benchmark/",
      ],
    },
    {
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            args: "all",
            argsIgnorePattern: "^_",
            caughtErrors: "all",
            caughtErrorsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
          },
        ],
        "@typescript-eslint/restrict-template-expressions": ["off"],
      },
    }
  ),
  eslintPluginUnicorn.configs["flat/recommended"],
  {
    rules: {
      "unicorn/filename-case": ["off"],
      "unicorn/no-array-reduce": ["off"],
      "unicorn/prevent-abbreviations": ["warn"],
      "unicorn/prefer-raw-string": ["off"],
      "unicorn/no-useless-undefined": ["off"],
      "@typescript-eslint/no-non-null-assertion": ["warn"],
      "@typescript-eslint/no-base-to-string": ["warn"],
    },
  },
];
