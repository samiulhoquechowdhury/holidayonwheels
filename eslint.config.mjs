import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // `any` is banned outright by the brief — an error, not a warning, so it
      // cannot reach main.
      "@typescript-eslint/no-explicit-any": "error",
      // A leading underscore marks an argument that exists to satisfy a
      // signature we intend to honour later — see config/external.ts, where
      // the rental deep-link contract is still unconfirmed.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      // Output of `NEXT_DIST_DIR=.next-verify pnpm build`. Without this a
      // local `eslint .` — which is exactly what CI runs — drowns in ~8,600
      // problems from compiled chunks. CI never sees them because it builds
      // after linting; we build before.
      ".next-verify/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
