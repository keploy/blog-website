# Anti-Patterns

These are real patterns already present in the repo that the design review agent
should call out when they appear in new PRs.

## 1. Inline Typography Instead of Shared Utilities

### What it looks like

```tsx
<h3
  style={{
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "20px",
    fontWeight: 700,
    color: "rgb(29, 32, 34)",
  }}
>
```

From: `components/post-card.tsx`

### Why it's wrong

- Typography rules become hard to audit and harder to reuse.
- The repo already has clear article typography in `post-title.tsx` and
  `post-body.module.css`.
- PRs that add more of this make the design system less extractable.

### Correct alternative

Use an existing component or shared classes where possible:

```tsx
<PostTitle>{post.title}</PostTitle>
```

Or match existing utility-driven patterns:

```tsx
<h3 className="heading1 text-3xl lg:text-4xl font-bold leading-none">
  {title}
</h3>
```

## 2. Hardcoded Colors Instead of Theme or Repo Palette

### What it looks like

```tsx
style={{ backgroundColor: "#FFF4EE", color: "#1D2022" }}
```

From: `components/BlogSidebar.tsx`

### Why it's wrong

- It bypasses the palette in `tailwind.config.js`.
- It makes dark-mode/theme tokens unusable.
- The repo already has orange, neutral, and card tokens plus repeated Tailwind
  classes such as `bg-white`, `text-orange-500`, `border-gray-200`.

### Correct alternative

Prefer classes backed by repo tokens/palette:

```tsx
<div className="rounded-2xl bg-white border border-orange-300 text-gray-900">
```

Or use theme-aware primitives:

```tsx
<Card className="bg-card text-card-foreground border-border">
```

## 3. Arbitrary Values Without a Repeated Pattern

### What it looks like

```tsx
className="hover:shadow-[0_0_10px_2px_rgba(255,165,0,0.6)]"
```

From: `components/hero-post.tsx`

### Why it's wrong

- Arbitrary values are already widespread; adding more makes consistency worse.
- Many surfaces could use existing `shadow-md`, `shadow-lg`, or the shared nav
  card shadow pattern instead.

### Correct alternative

Use existing shadow utilities or one established shadow formula reused in a
shared component:

```tsx
className="hover:shadow-lg transition-all duration-300"
```

Or reuse a shared shell such as:

```tsx
<Card className="shadow-sm hover:shadow-lg transition-shadow" />
```

## 4. Duplicated Card Layouts Instead of `PostCard`

### What it looks like

```tsx
<div className="bg-gray-100 border p-6 rounded-md lg:hover:shadow-md transition">
  ...
</div>
```

From: `components/post-preview.tsx`, `components/TagsPostPreview.tsx`

### Why it's wrong

- The repo already has a standard post card in `components/post-card.tsx`.
- Duplicate feed cards drift in spacing, typography, hover states, and metadata.

### Correct alternative

Use the canonical feed components:

```tsx
<PostGrid>
  <PostCard
    title={node.title}
    coverImage={node.featuredImage}
    date={node.date}
    author={node.ppmaAuthorName}
    slug={node.slug}
    excerpt={getExcerpt(node.excerpt, 20)}
    isCommunity={false}
  />
</PostGrid>
```

## 5. Raw Buttons and Links Recreating Existing CTA Styling

### What it looks like

```tsx
<button className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600">
```

From: `components/more-stories.tsx`, `pages/tag/index.tsx`

### Why it's wrong

- CTA treatment already exists in `components/ui/button.tsx`.
- New ad hoc buttons drift on padding, radius, focus states, and disabled styles.

### Correct alternative

Use the shared button primitive:

```tsx
<Button onClick={loadMorePosts}>Load More Posts</Button>
```

Or if it must be a link:

```tsx
<Button asChild>
  <Link href="https://app.keploy.io/signin">Sign in</Link>
</Button>
```

## 6. Mixed Font Systems on the Same Surface

### What it looks like

```css
.heading1 { font-family: "Baloo 2", "bold", sans-serif; }
.footer-font { font-family: "__Inter_aaf875", "__Inter_Fallback_aaf875", sans-serif; }
```

And separately:

```css
.content { font-family: 'DM Sans', sans-serif; }
```

### Why it's wrong

- The repo already mixes Baloo 2, DM Sans, Inter, and Arial in different files.
- New PRs should reduce that spread, not add another font decision.

### Correct alternative

- Use `heading1` for branded marketing/listing headings.
- Use DM Sans for article content and metadata surfaces.
- Do not introduce a new font family unless there is an explicit design-system
  decision to do so.

## 7. Inconsistent Focus Treatments

### What it looks like

```tsx
className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
```

From: `components/more-stories.tsx`, `pages/tag/index.tsx`, `NotFoundPage.tsx`

### Why it's wrong

- Blue focus rings do not match the repo's tokenized `ring-ring` behavior in
  `components/ui/button.tsx` and `sheet.tsx`.
- Some legacy controls remove outlines but do not add an equally visible state.

### Correct alternative

If possible, use a shared primitive with built-in focus-visible handling:

```tsx
<Button variant="ghost" size="icon" aria-label="Open search">
```

Or align the custom control with theme tokens:

```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

## 8. Nested Interactive Elements

### What it looks like

```tsx
<Link href={`/tag/${name}`} key={name}>
  <button className="inline-flex items-center ...">{name}</button>
</Link>
```

From: `pages/tag/index.tsx`, `components/tag.tsx`

### Why it's wrong

- Nested interactive elements are an accessibility and semantics problem.
- Keyboard and screen-reader behavior can become inconsistent.

### Correct alternative

Style the link directly:

```tsx
<Link
  href={`/tag/${name}`}
  className="inline-flex items-center gap-2 rounded-full px-4 py-2"
  aria-label={`Open tag ${name}`}
>
  {name}
</Link>
```

## 9. One-Off Search Inputs Repeated Across Pages

### What it looks like

```tsx
<input
  className="w-full p-4 pl-10 rounded-full border border-gray-300 ..."
  placeholder="Search posts..."
/>
```

Appears in: `MoreStories`, `pages/tag/index.tsx`, `NotFoundPage.tsx`

### Why it's wrong

- The same search shell is duplicated across several files.
- Any tweak to spacing, focus, icon placement, or validation has to be made in
  multiple places.

### Correct alternative

- Prefer extracting a shared search input component when touching multiple
  implementations in one PR. `[inferred]`
- If you are not extracting, new code should match the existing pill pattern
  exactly rather than inventing another variant.

## 10. New Legacy-Surface Styling Instead of Consolidating

### What it looks like

```tsx
<div className="bg-gray-100 border p-6 rounded-md ...">...</div>
<div className="bg-white rounded-lg border border-gray-200 ...">...</div>
```

### Why it's wrong

- The repo already contains multiple near-duplicate card systems.
- Adding another variation compounds inconsistency in background, radius,
  shadow, metadata spacing, and type treatment.

### Correct alternative

Choose one of the existing directions and stay within it:

```tsx
<PostCard ... />
```

or

```tsx
<Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
```
