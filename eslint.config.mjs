import { defineConfig } from 'eslint/config'

import js from '@eslint/js'

import tseslint from 'typescript-eslint'

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**']
  },

  js.configs.recommended,

  tseslint.configs.recommended,

  eslintPluginPrettierRecommended,

  {
    files: ['src/**/*.ts', '__tests__/**/*.ts'],

    languageOptions: {
      sourceType: 'commonjs',

      parserOptions: {
        projectService: true,

        tsconfigRootDir: import.meta.dirname
      }
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',

      '@typescript-eslint/explicit-function-return-type': 'off',

      '@typescript-eslint/interface-name-prefix': 'off'
    }
  }
)
