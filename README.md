# Keploy's Blog Website 🚀

A modern, fast, and SEO-optimized blog website built with Next.js and powered by WordPress as a headless CMS. This project showcases Keploy's latest updates, tutorials, and community insights.

![Keploy Blog](https://img.shields.io/badge/Keploy-Blog-orange)
![Next.js](https://img.shields.io/badge/Next.js-13+-black)
![WordPress](https://img.shields.io/badge/WordPress-Headless-blue)
![GraphQL](https://img.shields.io/badge/GraphQL-API-pink)

## ✨ Features

- 🚀 **Lightning Fast** - Built with Next.js for optimal performance
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔍 **SEO Optimized** - Built-in SEO best practices
- 📝 **Headless CMS** - WordPress backend with GraphQL API
- 🎨 **Modern UI** - Clean and professional design
- ⚡ **Static Generation** - Fast loading with ISR (Incremental Static Regeneration)
- 🔄 **Real-time Updates** - Content updates automatically

## 🛠️ Tech Stack

- **Frontend Framework:** Next.js 13+
- **Content Management:** WordPress (Headless)
- **API:** GraphQL (WPGraphQL)
- **Styling:** CSS Modules
- **Deployment:** Vercel
- **CDN:** CloudFront

## 📁 Project Structure

```
blog-website/
├── components/          # Reusable React components
│   ├── layout/         # Layout components
│   ├── ui/             # UI components
│   └── blog/           # Blog-specific components
├── lib/                # Utility functions and API calls
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   ├── posts/         # Blog post pages
│   └── index.js       # Homepage
├── public/             # Static assets (images, icons, etc.)
├── styles/             # Global styles and CSS modules
├── types/              # TypeScript type definitions
└── utils/              # Helper utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- A WordPress site with WPGraphQL plugin
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/keploy/blog-website.git
   cd blog-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your WordPress GraphQL endpoint:
   ```bash
   WORDPRESS_API_URL=https://your-wordpress-site.com/graphql
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the blog in action! 🎉

## ⚙️ Configuration

### Step 1. Prepare your WordPress site

You'll need a WordPress site with the WPGraphQL plugin installed. Here are your options:

**Option A: Use WordPress.com or hosting provider**
- Set up WordPress on any hosting provider
- Install the WPGraphQL plugin

**Option B: Local development**
- Use [Local by Flywheel](https://localwp.com/) for local WordPress development

### Step 2. Install WPGraphQL Plugin

1. Download the [WPGraphQL plugin](https://github.com/wp-graphql/wp-graphql) as a ZIP file
2. In your WordPress admin, go to **Plugins → Add New**
3. Click **Upload Plugin** and select the ZIP file
4. **Activate** the plugin after installation

#### 🔍 GraphQL IDE

The WPGraphQL plugin provides a GraphQL IDE in your WordPress admin at `/wp-admin/admin.php?page=graphiql-ide`. Use this to:
- Explore your content structure
- Test GraphQL queries
- Debug API responses

### Step 3. Create Content

In your WordPress admin:

1. **Create Posts** (minimum 2 recommended)
   - Add engaging titles and content
   - Set featured images (try [Unsplash](https://unsplash.com/) for free images)
   - Write compelling excerpts
   - Choose appropriate categories and tags
   - **Publish** when ready

2. **Configure Authors**
   - Set up author profiles
   - Add author bios and avatars

> **💡 Tip:** Only published posts with public visibility will appear in the blog

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy! 🎉

### Environment Variables for Production

```bash
WORDPRESS_API_URL=https://your-wordpress-site.com/graphql
```

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Here's how you can help:

### 🐛 Found a Bug?

1. Check [existing issues](https://github.com/keploy/blog-website/issues) first
2. If it's new, [create an issue](https://github.com/keploy/blog-website/issues/new) with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### 💡 Want to Add a Feature?

1. [Open an issue](https://github.com/keploy/blog-website/issues/new) to discuss your idea
2. Wait for maintainer feedback
3. Fork the repository
4. Create your feature branch (`git checkout -b feature/amazing-feature`)
5. Make your changes
6. Test thoroughly
7. Commit with clear messages (`git commit -m 'Add amazing feature'`)
8. Push to your branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### 📝 Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Be respectful and collaborative

### 🏷️ Good First Issues

Look for issues labeled `good first issue` or `api-fellowship` - these are perfect for newcomers!

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [WPGraphQL Documentation](https://www.wpgraphql.com/docs/introduction/) - WordPress GraphQL API
- [Keploy Documentation](https://docs.keploy.io/) - Learn about Keploy's testing platform

## 🐛 Troubleshooting

### Common Issues

**CSS files not loading on deployment:**
- This is handled by CloudFront redirection for `/blogs/*` paths
- Ensure your build process includes all CSS files

**GraphQL connection issues:**
- Verify your `WORDPRESS_API_URL` is correct
- Check if WPGraphQL plugin is activated
- Test your GraphQL endpoint in the WordPress admin

**Build failures:**
- Clear your `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).

## 🤝 Contributors

Thanks to these amazing people who have contributed to this project:

- [Dhruv](https://github.com/dhruvv028) - API Fellow | Full-Stack Developer

Want to contribute? Check out our [contribution guidelines](#-contributing) and join our community!

---

<div align="center">

**Made with ❤️ by the Keploy Community**

[![Contributors](https://img.shields.io/github/contributors/keploy/blog-website)](https://github.com/keploy/blog-website/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/keploy/blog-website)](https://github.com/keploy/blog-website/stargazers)
[![Forks](https://img.shields.io/github/forks/keploy/blog-website)](https://github.com/keploy/blog-website/network/members)
[![Issues](https://img.shields.io/github/issues/keploy/blog-website)](https://github.com/keploy/blog-website/issues)

[🌟 Star this repo](https://github.com/keploy/blog-website) • [🐛 Report Bug](https://github.com/keploy/blog-website/issues) • [💡 Request Feature](https://github.com/keploy/blog-website/issues)

</div>