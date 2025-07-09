# Keploy Blog Website 🚀

A fast, SEO-friendly blog website built with **Next.js** and powered by **WordPress** as a headless CMS.  
This site hosts Keploy’s official blogs, announcements, tutorials, and community news.

---

## ⚙️ Configuration & Setup Guide

### Step 1️⃣ — Prepare your WordPress site

- You need a WordPress site (self-hosted, Local by Flywheel, or any WP host).
- Install the [WPGraphQL plugin](https://github.com/wp-graphql/wp-graphql) to enable GraphQL API.

**How to install WPGraphQL:**
1. Download WPGraphQL ZIP archive.
2. In WordPress Admin → Plugins → Add New → Upload Plugin.
3. Upload & activate WPGraphQL.

**GraphQL:**  
You can explore your GraphQL API from the GraphQL IDE in WordPress Admin.

---

### Step 2️⃣ — Add Content

- Add at least 2 posts in WordPress Admin → Posts.
- Use dummy data for content.
- Set:
  - Author
  - Featured Image (Unsplash)
  - Excerpt
- Publish the posts.  
  _Only published posts & public fields will show in the app._

---

### Step 3️⃣ — Clone this Repository

```bash
git clone https://github.com/keploy/blog-website.git
cd blog-website
