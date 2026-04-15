// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  mainSidebar: [
    {
      type: "doc",
      id: "intro",
      label: "Introduction",
    },
    {
      type: "category",
      label: "Getting started",
      collapsed: false,
      items: ["install", "authentication", "output-styles"],
    },
    {
      type: "category",
      label: "Command reference",
      collapsed: false,
      items: [
        "commands/auth",
        "commands/branch",
        "commands/pr",
        "commands/pipeline",
        "commands/env",
        "commands/browse",
        "commands/option",
      ],
    },
    {
      type: "doc",
      id: "contributing",
      label: "Contributing",
    },
  ],
};

export default sidebars;
