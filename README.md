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

### Theme Screenshots

The gallery automatically fetches screenshots from your repository. There are two ways to provide them:

#### Option 1: Automatic Discovery (Recommended)

Place your screenshots in one of these folders:
- `/screenshots/`
- `/assets/screenshots/`
- `/docs/screenshots/`
- `/.github/screenshots/`

The gallery will automatically detect and display them (supports png, jpg, gif, webp).

**Example structure:**
```
your-theme/
├── screenshots/
│   ├── 01.png  # Full screen presentation view
│   ├── 02.png  # Another slide example
│   └── 03.png
└── package.json
```

#### Option 2: Manual Configuration

Add a `slidev.screenshots` field in your `package.json`:

```json
{
  "name": "slidev-theme-awesome",
  "slidev": {
    "screenshots": [
      "https://raw.githubusercontent.com/user/repo/main/preview1.png",
      "https://raw.githubusercontent.com/user/repo/main/preview2.png"
    ]
  }
}
```

**Tips:**
- Use full-screen presentation screenshots (1920x1080 recommended)
- Multiple screenshots will animate on hover
- Images are automatically extracted from README as fallback

Or [open an issue](https://github.com/plumiume/slidev-theme-preview/issues/new) to submit manually.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
