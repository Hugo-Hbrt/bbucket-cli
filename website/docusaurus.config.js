// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).

import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "bb — Bitbucket CLI",
  tagline: "Manage branches, pull requests, pipelines, and environments from the terminal",
  favicon: "img/favicon.ico",

  // GitHub Pages configuration
  url: "https://hugo-hbrt.github.io",
  baseUrl: "/bbucket-cli/",

  organizationName: "Hugo-Hbrt",
  projectName: "bbucket-cli",
  deploymentBranch: "gh-pages",
  trailingSlash: false,

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          editUrl: "https://github.com/Hugo-Hbrt/bbucket-cli/tree/main/website/",
          routeBasePath: "/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: "light",
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "bb",
        items: [
          {
            type: "docSidebar",
            sidebarId: "mainSidebar",
            position: "left",
            label: "Docs",
          },
          {
            href: "https://github.com/Hugo-Hbrt/bbucket-cli",
            label: "GitHub",
            position: "right",
          },
          {
            href: "https://www.npmjs.com/package/@hugo-hebert/bbucket-cli",
            label: "npm",
            position: "right",
          },
        ],
      },
      footer: {
        style: "light",
        links: [
          {
            title: "Docs",
            items: [
              { label: "Getting started", to: "/" },
              { label: "Install", to: "/install" },
              { label: "Authentication", to: "/authentication" },
              { label: "Output styles", to: "/output-styles" },
            ],
          },
          {
            title: "Reference",
            items: [
              { label: "bb auth", to: "/commands/auth" },
              { label: "bb branch", to: "/commands/branch" },
              { label: "bb pr", to: "/commands/pr" },
              { label: "bb pipeline", to: "/commands/pipeline" },
              { label: "bb env", to: "/commands/env" },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/Hugo-Hbrt/bbucket-cli",
              },
              {
                label: "npm",
                href: "https://www.npmjs.com/package/@hugo-hebert/bbucket-cli",
              },
              {
                label: "Issues",
                href: "https://github.com/Hugo-Hbrt/bbucket-cli/issues",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Hugo Hebert. MIT licensed.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ["bash", "json"],
      },
    }),
};

export default config;
