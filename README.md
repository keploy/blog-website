# Keploy's blog with Next.js and WordPress

## Configuration

### Step 1. Clone the repository

```bash
git clone https://github.com/keploy/blog-website.git
cd blog-website
```

### Step 2. Install dependencies

```bash
npm install

# or

yarn install
```

### Step 3. Set up environment variables
Copy the .env.local.example file in this directory to .env.local (which will be ignored by Git):

```bash
cp .env.local.example .env.local
```

Then open .env.local and set WORDPRESS_API_URL to be the URL to your GraphQL endpoint in WordPress. For example: https://Testapp.com/graphql.

Your .env.local file should look like this:

```bash
WORDPRESS_API_URL=...
```

### Step 4. Run Next.js in development mode
```bash
npm run dev

# or

yarn dev
```
Your blog should be up and running on http://localhost:3000! If it doesn't work, post on GitHub discussions.
