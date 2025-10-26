export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'slate',
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted',
      },
    },
  },
  seo: {
    siteName: 'Assembler UI',
  },
  header: {
    title: 'Assembler UI',
    to: '/',
    logo: {
      alt: 'Assembler UI',
      light: '',
      dark: '',
    },
    search: true,
    colorMode: true,
    links: [
      {
        icon: 'i-simple-icons-github',
        to: 'https://github.com/benoitlahoz/assembler-ui',
        target: '_blank',
        'aria-label': 'GitHub',
      },
    ],
  },
  footer: {
    credits: 'Built with Assembler UI • © ' + new Date().getFullYear(),
    colorMode: false,
    links: [
      {
        icon: 'i-simple-icons-github',
        to: 'https://github.com/benoitlahoz/assembler-ui',
        target: '_blank',
        'aria-label': 'Assembler UI on GitHub',
      },
      {
        icon: 'i-simple-icons-x',
        to: 'https://twitter.com/assemblerui',
        target: '_blank',
        'aria-label': 'Assembler UI on X',
      },
      {
        icon: 'i-simple-icons-discord',
        to: 'https://discord.gg/assemblerui',
        target: '_blank',
        'aria-label': 'Assembler UI Discord',
      },
    ],
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/benoitlahoz/assembler-ui/edit/main/content',
      links: [
        {
          icon: 'i-lucide-star',
          label: 'Star on GitHub',
          to: 'https://github.com/benoitlahoz/assembler-ui',
          target: '_blank',
        },
        {
          icon: 'i-lucide-code',
          label: 'Browse Components',
          to: '/components',
          target: '_self',
        },
        {
          icon: 'i-lucide-layout-template',
          label: 'View Examples',
          to: '/examples',
          target: '_self',
        },
      ],
    },
  },
})
