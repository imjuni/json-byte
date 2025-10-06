export const tsFiles = ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.tsx', '**/*.d.ts'];

export const customEslintRule = [
  {
    rules: {
      // ----------------------------------------------------------------------------------------------------------
      // eslint
      // ----------------------------------------------------------------------------------------------------------
      'max-len': [
        'error',
        {
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
          ignoreTrailingComments: true,
          code: 120,
        },
      ],
      'no-underscore-dangle': ['error', { allowAfterThis: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration:not([const=true])',
          message: "Don't declare non-const enums",
        },
      ],
    },
  },
];

export const customOverrideImportXPlugin = [
  // ----------------------------------------------------------------------------------------------------------
  // eslint-plugin-import
  // ----------------------------------------------------------------------------------------------------------
  {
    rules: {
      'import-x/prefer-default-export': 'off',
      'import-x/no-default-export': 'error',
    },
  },
  {
    files: ['src/app/**/*.tsx'],
    rules: {
      'import-x/prefer-default-export': ['error'],
      'import-x/no-default-export': ['off'],
    },
  },
  {
    files: ['next.config.ts', 'vitest.config.{ts,mts}', 'postcss.config.mjs'],
    rules: {
      'import-x/prefer-default-export': ['error'],
      'import-x/no-default-export': ['off'],
    },
  },
];

export const customOverrideEslintRule = [
  {
    files: ['**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message: 'Avoid for..in; it iterates over the entire prototype chain.',
        },
        {
          selector: 'ForStatement',
          message: 'Avoid classic for loops; prefer Array methods or for..of when appropriate.',
        },
        {
          selector: 'WhileStatement',
          message: 'Avoid while loops; prefer for..of or Array methods.',
        },
        {
          selector: 'DoWhileStatement',
          message: 'Avoid do..while loops; prefer for..of or Array methods.',
        },
        {
          selector: 'LabeledStatement',
          message: 'Labels are a form of GOTO.',
        },
        {
          selector: 'WithStatement',
          message: '`with` is disallowed.',
        },
      ],
    },
  },
  {
    files: ['vitest.config.mts', 'eslint.config.mjs', 'eslint.custom.config.mjs'],
    rules: {
      'import-x/no-extraneous-dependencies': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['vitest.config.mts'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },
  {
    files: ['eslint.config.mjs'],
    rules: {
      'import-x/no-default-export': 'off',
      'import-x/extensions': 'off',
      'import-x/no-rename-default': 'off',
    },
  },
  {
    files: ['**/CE_*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'max-classes-per-file': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-namespace': 'off',
      'class-methods-use-this': 'off',
      'n/no-sync': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['prepublish.cjs'],
    rules: {
      'no-console': 'off',
      'n/no-process-exit': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-fragments': ['error', 'syntax'], // Allow <> shorthand
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import-x/no-absolute-path': 'off', // Allow Vite public folder absolute paths
      'import-x/no-unresolved': ['error', { ignore: ['^/'] }], // Ignore paths starting with /
    },
  },
];

export const customIgnore = [
  {
    ignores: [
      './.configs/**',
      '**/dist/**/*',
      'examples/*',
      'eslint.config.mjs',
      'eslint.config.custom.mjs',
      'vitest.config.mts',
    ],
  },
];

export const customTsconfig = {
  files: tsFiles,
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.eslint.json'],
    },
  },
};

export const customTypescriptRule = [
  {
    name: 'project/custom/typescript/rules',
    files: tsFiles,
    rules: {
      // ----------------------------------------------------------------------------------------------------------
      // @typescript-eslint
      // ----------------------------------------------------------------------------------------------------------
      // '@typescript-eslint/naming-convention': [
      //   'error',
      //   {
      //     selector: 'interface',
      //     format: ['PascalCase'],
      //     custom: {
      //       regex: '^I[A-Z]+',
      //       match: true,
      //     },
      //   },
      //   {
      //     selector: 'typeAlias',
      //     format: ['PascalCase'],
      //     custom: {
      //       regex: '^T[A-Z]+',
      //       match: true,
      //     },
      //   },
      // ],
      '@typescript-eslint/member-delimiter-style': [
        'off',
        {
          multiline: {
            delimiter: 'none',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_.+$',
          argsIgnorePattern: '^_.+$',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
    },
  },
];
