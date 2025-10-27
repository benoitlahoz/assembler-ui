import { useI18n } from "vue-i18n";

// const { t } = useI18n();
import { $t } from "./i18n/locales";

export default defineAppConfig({
  shadcnDocs: {
    site: {
      name: "Assembler UI",
      description: "Build beautiful websites using Vue & Nuxt.",
      ogImage: "https://cdn.assembler-ui.com/og-image-v2.1.png",
    },
    theme: {
      customizable: true,
      color: "zinc",
      radius: 0.75,
    },
    header: {
      title: "Assembler UI",
      showTitle: true,
      darkModeToggle: true,
      logo: {
        light: "https://cdn.assembler-ui.com/logo.svg",
        dark: "https://cdn.assembler-ui.com/logo-dark.svg",
      },
      nav: [
        {
          title: $t("nav.Docs"),
          links: [
            {
              title: $t("nav.GettingStarted"),
              to: "/getting-started/introduction",
              description: $t("nav.GettingStartedDescription"),
            },
            {
              title: $t("nav.Installation"),
              to: "/getting-started/installation",
              description: $t("nav.InstallationDescription"),
            },
            {
              title: $t("nav.Components"),
              to: "/components",
              description: $t("nav.ComponentsDescription"),
              target: "_self",
            },
          ],
        },
        {
          title: "Credits",
          links: [
            {
              title: "Inspira UI",
              to: "https://inspira-ui.com",
              description: "For providing the documentation and registry boilerplate.",
              target: "_blank",
            },
            {
              title: "shadcn-vue",
              to: "https://www.shadcn-vue.com/",
              description: "For the Vue port of shadcn-ui and contributions to some components",
              target: "_blank",
            },
            {
              title: "shadcn-docs-nuxt",
              to: "https://github.com/ZTL-UwU/shadcn-docs-nuxt",
              description: "For the beautifully crafted Nuxt documentation site.",
              target: "_blank",
            },
          ],
        },
      ],
      links: [
        {
          icon: "lucide:github",
          to: "https://github.com/benoitlahoz/assembler-ui",
          target: "_blank",
        },
      ],
    },
    aside: {
      useLevel: true,
      collapse: false,
      folderStyle: "tree",
      levelStyle: "aside",
    },
    main: {
      breadCrumb: true,
      showTitle: true,
      padded: true,
      codeCopyToast: true,
    },
    footer: {
      credits: "Copyright © 2025",
      links: [
        {
          icon: "lucide:globe",
          to: "https://benoitlahoz.io",
          title: "Maintained by benoitlahoz",
          target: "_blank",
        },
        {
          icon: "lucide:github",
          title: "Github",
          to: "https://github.com/benoitlahoz/assembler-ui",
          target: "_blank",
        },
      ],
    },
    toc: {
      enable: true,
      title: $t("toc.title"),
      enableInHomepage: false,
      links: [
        {
          title: $t("toc.StarOnGitHub"),
          icon: "lucide:star",
          to: "https://github.com/benoitlahoz/assembler-ui",
          target: "_blank",
        },
        {
          title: $t("toc.CreateIssues"),
          icon: "lucide:circle-dot",
          to: "https://github.com/benoitlahoz/assembler-ui/issues",
          target: "_blank",
        },
        {
          title: $t("toc.Forum"),
          icon: "lucide:newspaper",
          to: "https://github.com/benoitlahoz/assembler-ui/discussions",
          target: "_blank",
        },
      ],
    },
    search: {
      enable: true,
    },
  },
});
