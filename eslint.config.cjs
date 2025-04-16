const { FlatCompat } = require('@eslint/eslintrc');
// const path = require('path');

const compat = new FlatCompat({

  baseDirectory: __dirname,

});

module.exports = [

  ...compat.config({

    extends: ['airbnb-base'],

    env: {

      browser: true, // Для работы с document, window, localStorage

      es2021: true, // Для поддержки современных возможностей JavaScript

    },

    parserOptions: {

      ecmaVersion: 'latest',

      sourceType: 'module',

    },

    rules: {

      // Разрешить использование консоли
      'no-console': 'off',

      // Отключить требование именования функций
      'func-names': 'off',

      // Требовать использование одинарных кавычек
      quotes: ['error', 'single'],

      // Требовать точки с запятой
      semi: ['error', 'always'],

      // Запретить неиспользуемые переменные
      'no-unused-vars': ['warn'],

      // Отступы в 2 пробела
      indent: ['error', 2],

      // Запретить использование var
      'no-var': 'error',

      // Запретить использование неявного приведения типов
      'linebreak-style': ['error', 'unix'],

      // Пробелы вокруг ключевых слов
      'keyword-spacing': ['error', { before: true, after: true }],

      // Пробелы вокруг операторов
      'no-restricted-globals': 'off',

      // Pазрешить использование alert
      'no-alert': 'off',

      // Разрешить использование ++
      'no-plusplus': 'off',

      // Отключить проверку на использование зависимостей из devDependencies
      'import/no-extraneous-dependencies': 'off',

    },

  }),

];
