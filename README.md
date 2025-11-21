# Keploy's blog with Next.js and WordPress

## Configuration

### Step 1. Prepare your WordPress site

First, you need a WordPress site. There are many solutions for WordPress hosting or you could use a Local by flywheel for setting up WordPress locally.

Once the site is ready, you'll need to install the [WPGraphQL](https://www.wpgraphql.com/) plugin. It will add GraphQL API to your WordPress site, which we'll use to query the posts. Follow these steps to install it:

- Download the [WPGraphQL repo](https://github.com/wp-graphql/wp-graphql) as a ZIP archive.
- Inside your WordPress admin, go to **Plugins** and then click **Add New**.
- Click the **Upload Plugin** button at the top of the page and upload the WPGraphQL plugin.
- Once the plugin has been added, activate it from either the **Activate Plugin** button displayed after uploading or from the **Plugins** page.

#### GraphQL

The [WPGraphQL](https://www.wpgraphql.com/) plugin also gives you access to a GraphQL IDE directly from your WordPress Admin, allowing you to inspect and play around with the GraphQL API.

### Step 2. Populate Content

Inside your WordPress admin, go to **Posts** and start adding new posts:

- We recommend creating at least **2 posts**
- Use dummy data for the content
- Pick an author from your WordPress users
- Add a **Featured Image**. You can download one from [Unsplash](https://unsplash.com/)
- Fill the **Excerpt** field

When you’re done, make sure to **Publish** the posts.

> **Note:** Only **published** posts and public fields will be rendered by the app

### Step 3. Clone the repository

```bash
git clone https://github.com/keploy/blog-website.git
cd blog-website
```

### Step 4. Install dependencies

```bash
npm install

# or

yarn install
```

### Step 5. Set up environment variables
Copy the .env.local.example file in this directory to .env.local (which will be ignored by Git):

```bash
cp .env.local.example .env.local
```

Then open .env.local and set WORDPRESS_API_URL to be the URL to your GraphQL endpoint in WordPress. For example: https://Testapp.com/graphql.

Your .env.local file should look like this:

```bash
WORDPRESS_API_URL=...
```

### Verify your WordPress GraphQL endpoint

Before running the dev server or build, verify that `WORDPRESS_API_URL` points to a working WPGraphQL endpoint. You can use the included validator script:

```bash
# Uses the env var if set, or pass a URL as the first argument
npm run verify-endpoint -- https://your-wordpress-site.com
```

This script will try the provided URL and automatically try `URL/graphql` as a fallback. It prints a short response snippet when the endpoint doesn't return JSON to help debugging.

### Step 6. Run Next.js in development mode
```bash
npm run dev

# or

yarn dev
```
Your blog should be up and running on http://localhost:3000! If it doesn't work, post on GitHub discussions.


For CSS files being rendered at vercel and not on keploy enpoint - we set generic redirection /blogs/* on cloudfront. 
