import nx from "@nx/eslint-plugin";
import baseConfig from "../../../eslint.base.config.mjs";

export default [
    ...baseConfig,
    {
        files: [
            "**/*.json"
        ],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: [
                        "{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"
                    ]
                }
            ]
        },
        languageOptions: {
            parser: await import("jsonc-eslint-parser")
        }
    },
    ...nx.configs["flat/angular"],
    ...nx.configs["flat/angular-template"],
    {
        files: [
            "**/*.ts"
        ],
        rules: {
            "@angular-eslint/directive-selector": [
                "error",
                {
                    type: "attribute",
                    prefix: "hlm",
                    style: "camelCase"
                }
            ],
            "@angular-eslint/component-selector": [
                "error",
                {
                    type: "element",
                    prefix: "hlm",
                    style: "kebab-case"
                }
            ]
        }
    },
    {
        files: [
            "**/*.html"
        ],
        // Override or add rules here
        rules: {}
    }
];
