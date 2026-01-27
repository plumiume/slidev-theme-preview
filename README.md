# Slidev Theme Preview

🎨 **Discover and explore Slidev presentation themes**

A gallery website for browsing, previewing, and discovering [Slidev](https://sli.dev) themes from npm and the community.

[![Azure Static Web Apps CI/CD](https://github.com/plumiume/slidev-theme-preview/actions/workflows/azure-static-web-apps.yml/badge.svg)](https://github.com/plumiume/slidev-theme-preview/actions/workflows/azure-static-web-apps.yml)

## Features

- 📦 **Auto-discovery** - Automatically fetches themes from npm with `slidev-theme` keyword
- 🔍 **Search & Filter** - Search by name, author, description; filter by official/community
- 📊 **Stats** - View download counts, versions, and update dates
- 🌙 **Dark Mode** - System preference detection with manual toggle
- 🚀 **Submit Your Theme** - Easy submission process for theme authors

## Tech Stack

- **Framework**: Vue 3 + TypeScript
- **Build**: Vite (Rolldown)
- **UI**: Naive UI
- **State**: Pinia
- **Router**: Vue Router 4
- **Hosting**: Azure Static Web Apps

## Routes

| Path | Description |
|------|-------------|
| `/` | Theme gallery home |
| `/preview/:themeName` | Live theme preview |
| `/detail/:themeName` | Theme details & installation |
| `/submit` | Submit your theme |

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Submit Your Theme

1. **Create your theme** following the [official guide](https://sli.dev/guide/theme-addon)
2. **Publish to npm** with keyword `slidev-theme`
3. Your theme will be automatically discovered! 🎉

Or [open an issue](https://github.com/plumiume/slidev-theme-preview/issues/new) to submit manually.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
