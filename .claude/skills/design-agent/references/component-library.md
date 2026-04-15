# Component Library

This inventory focuses on reusable components exported from `components/`,
`components/ui/`, and `components/navbar/`. "When NOT to use" is intentionally
strict so PR review can push contributors toward existing patterns.

## Core Layout

| Name | File | Purpose | When to use | When NOT to use | Props summary | Example |
| --- | --- | --- | --- | --- | --- | --- |
| `Layout` | `components/layout.tsx` | Global page wrapper with metadata, footer, scroll-to-top, analytics scripts, and top padding. | Any page-level route component. | Small isolated subtrees inside a page. | `preview`, `children`, `featuredImage`, `Title`, `Description`, optional `structuredData`, `canonicalUrl`, `ogType`, `publishedDate`. | `<Layout preview={preview} featuredImage={img} Title="Page" Description="..."><main>Page content</main></Layout>` |
| `Container` | `components/container.tsx` | Main max-width page container. | Listing/home/tag/authors pages. | Full-bleed hero art or article shell needing custom widths. | `children`. | `<Container><TopBlogs ... /></Container>` |
| `ContainerSlug` | `components/containerSlug.tsx` | Wide responsive shell for article body/TOC/sidebar layout. | Article content areas. | Standard marketing/listing pages. | `children`. | `<ContainerSlug><PostBody ... /></ContainerSlug>` |
| `Header` | `components/header.tsx` | Fixed header wrapper around `FloatingNavbar` plus optional reading progress bar. | All main pages, especially article pages. | Footer-only or isolated widgets. | Optional `readProgress`. | `<Header readProgress={readProgress} />` |
| `Footer` | `components/footer.tsx` | Site footer with product/resource/company links and social icons. | Included automatically by `Layout`. | Do not render manually inside pages already using `Layout`. | none. | `<Footer />` |
| `Meta` | `components/meta.tsx` | SEO and social meta tags + JSON-LD injection. | Internal helper used by `Layout`. | Direct page use unless bypassing `Layout`. | Same SEO props as `Layout`. | `<Meta Title={title} Description={desc} featuredImage={img} />` |
| `Logo` | `components/logo.tsx` | Keploy logo link. | When a standalone logo link is needed. | When the header already renders the logo. | none. | `<Logo />` |

## Post Listing and Feed Components

| Name | File | Purpose | When to use | When NOT to use | Props summary | Example |
| --- | --- | --- | --- | --- | --- | --- |
| `PostCard` | `components/post-card.tsx` | Primary reusable blog card used in most grids. | Any post grid on home, category, tag, 404, author pages. | Do not rebuild this layout for standard feed cards. | `title`, `coverImage`, `date`, `excerpt`, `author`, `slug`, optional `isCommunity`. | `<PostCard title={post.title} coverImage={post.featuredImage} ... />` |
| `PostGrid` | `components/post-grid.tsx` | Standard responsive 1/2/3-column grid wrapper. | Wrapping `PostCard` collections. | Single-column article content or bespoke nav card layouts. | `children`. | `<PostGrid>{posts.map(...)}</PostGrid>` |
| `HeroPost` | `components/hero-post.tsx` | Featured top-of-list card for category landing pages. | First item on technology/community landing pages. | Generic post cards lower in the feed. | `title`, `coverImage`, `date`, `excerpt`, `author`, `slug`, optional `isCommunity`. | `<HeroPost {...heroPost} isCommunity={false} />` |
| `LatestPost` | `components/latest-post.tsx` | Alternate "latest blog post" hero with CTA link. | A single featured latest-post block. | Standard listing grids. | Same shape as `HeroPost`. | `<LatestPost {...post} />` |
| `MoreStories` | `components/more-stories.tsx` | Searchable, paginated/infinite-load feed section. | Category pages, article pages, search pages. | Simple static lists without pagination/search. | `posts`, `isCommunity`, `isIndex`, optional `isSearchPage`, `showSearch`, `initialPageInfo`, `externalSearchTerm`, `onSearchChange`. | `<MoreStories posts={morePosts} isCommunity={true} isIndex={false} showSearch />` |
| `TopBlogs` | `components/topBlogs.tsx` | Home page split section for recent technology/community posts. | Homepage only or very similar dual-feed landing surfaces. | Single-category lists. | `communityPosts`, `technologyPosts`. | `<TopBlogs communityPosts={...} technologyPosts={...} />` |
| `TagsStories` | `components/TagsStories.tsx` | Tag detail page heading plus post grid. | `/tag/[slug]` route. | Generic feed sections elsewhere. | `posts`. | `<TagsStories posts={posts} />` |
| `TagsPostPreview` | `components/TagsPostPreview.tsx` | Older tag preview card pattern. | Legacy tag-related previews only. | Prefer `PostCard` for new work. | `title`, `coverImage`, `date`, `excerpt`, `author`, `slug`, `isCommunity`. | `<TagsPostPreview {...post} isCommunity={post.categories} />` |
| `PostPreview` | `components/post-preview.tsx` | Older preview card using Baloo 2 styling. | Legacy surfaces already using this exact look. | Prefer `PostCard` in new feed work. | `title`, `coverImage`, `date`, `excerpt`, `author`, `slug`, optional `isCommunity`. | `<PostPreview {...post} />` |
| `Tweets` | `components/tweets.tsx` | Single linked social proof card. | When rendering embedded tweet/testimonial-like content outside marquee. | Standard blog post cards. | `avatar`, `name`, `id`, `post`, `content`. | `<Tweets avatar={a} name={n} id={id} post={url} content={text} />` |
| `Testimonials` | `components/testimonials.tsx` | Home page testimonial marquee. | Community/testimonial section on home. | Article page sidebars or post listings. | none; reads from service data. | `<Testimonials />` |
| `Marquee` | `components/Marquee.tsx` | Utility marquee wrapper with horizontal/vertical looping. | Scrolling testimonials or badges. | Static lists or where motion would hurt readability. | `children`, optional `reverse`, `pauseOnHover`, `vertical`, `repeat`, `className`. | `<Marquee pauseOnHover className="[--duration:17s]">...</Marquee>` |

## Article Page Components

| Name | File | Purpose | When to use | When NOT to use | Props summary | Example |
| --- | --- | --- | --- | --- | --- | --- |
| `PostHeader` | `components/post-header.tsx` | Article header composition: cover image, categories, title, author block. | Technology/community article pages. | Listing cards or non-article pages. | `title`, `coverImage`, `date`, `author`, `categories`, `BlogWriter`, `BlogReviewer`, `TimeToRead`, `tags`. | `<PostHeader title={post.title} coverImage={post.featuredImage} ... />` |
| `PostTitle` | `components/post-title.tsx` | DM Sans article title with clamp sizing and title-casing. | Main article `h1`. | Marketing headings that use `heading1`. | `children: string`. | `<PostTitle>{post.title}</PostTitle>` |
| `Categories` | `components/categories.tsx` | Category link row above article title. | Article headers. | General-purpose pill tags; use `Tag` or tag links instead. | `categories`. | `<Categories categories={post.categories} />` |
| `PostHeaderAuthors` | `components/PostHeaderAuthors.tsx` | Author/reviewer summary row with hover cards, date, reading time, tags. | Main article headers. | Compact cards or generic author lists. | `blogwriter`, `blogreviewer`, `timetoRead`, `date`, optional `tags`. | `<PostHeaderAuthors blogwriter={writer} blogreviewer={reviewer} timetoRead={time} date={post.date} />` |
| `PostBody` | `components/post-body.tsx` | Article content renderer with TOC, code blocks, author cards, and sidebar. | Technology/community article bodies. | Generic HTML snippets elsewhere. | `content`, `authorName`, `authorImageUrl`, `authorDescription`, `ReviewAuthorDetails`, `slug`, optional `categories`. | `<PostBody content={html} authorName={name} ... />` |
| `TableContents` | `components/TableContents.tsx` | Responsive article TOC; dropdown on small screens, card on wide screens. | Inside `PostBody` article layouts. | Generic page side nav outside article headings. | `headings`, `isList`, `setIsList`. | `<TOC headings={tocItems} isList={isList} setIsList={setIsList} />` |
| `BlogSidebar` | `components/BlogSidebar.tsx` | Share controls plus sidebar ad/CTA. | Right rail of article pages. | Non-article pages. | none. | `<BlogSidebar />` |
| `AuthorCard` | `components/AuthorCard.tsx` | Reusable writer/reviewer identity card. | End-of-article author/reviewer blocks. | Listing-card author metadata. | `name`, `imageUrl`, `description`, `role`, optional `linkedIn`, `basePath`. | `<AuthorCard name={name} imageUrl={img} description={bio} role="Writer" />` |
| `CoverImage` | `components/cover-image.tsx` | Responsive image wrapper with optional post link and priority loading. | Post cards, heroes, post headers. | Decorative non-post images. | `coverImage`, optional `title`, `slug`, `isCommunity`, `imgClassName`, `priority`, `sizes`. | `<CoverImage coverImage={post.featuredImage} slug={post.slug} />` |
| `Date` | `components/date.tsx` | ISO date formatter. | Post metadata display. | Freeform dates or ranges needing custom formatting. | `dateString`. | `<Date dateString={post.date} />` |
| `Avatar` | `components/avatar.tsx` | Very lightweight author name display. | Legacy hero/preview cards already using it. | New avatar/photo designs; it does not render an image. | `author`. | `<Avatar author={post.ppmaAuthorName} />` |
| `Tag` | `components/tag.tsx` | Styled tag chip cloud with icon assignment and color hashing. | Article footer tags or tag collections. | Simple category labels or plain links. | `tags.edges`. | `<Tag tags={post.tags} />` |
| `SectionSeparator` | `components/section-separator.tsx` | Standard post-footer separator. | Between article footer blocks and more stories. | Arbitrary dividers elsewhere if a local divider is clearer. | none. | `<SectionSeparator />` |
| `JsonDiffViewer` | `components/json-diff-viewer.tsx` | Interactive JSON diff demo rendered for one specific article slug. | Only for JSON-comparison article content. | General article rendering. | none. | `<JsonDiffViewer />` |
| `ScrollToTop` | `components/ScrollToTop.tsx` | Floating circular progress/back-to-top control. | Globally via `Layout`. | Manual page-level duplication. | none. | `<ScrollToTop />` |

## Navigation Components

| Name | File | Purpose | When to use | When NOT to use | Props summary | Example |
| --- | --- | --- | --- | --- | --- | --- |
| `FloatingNavbar` | `components/navbar/FloatingNavbar.tsx` | Responsive nav shell with glass styling and scrolled/reading-page variants. | Header navigation across the site. | Sidebar nav or article TOC. | Optional `isBlogReadingPage`. | `<FloatingNavbar isBlogReadingPage />` |
| `FloatingNavbarClient` | `components/navbar/FloatingNavbarClient.tsx` | Desktop dropdowns, mobile menu, search modal, social counters. | Internal nav implementation. Extend this instead of replacing it. | New standalone nav system. | Optional `techLatest`, `communityLatest`, `isScrolled`. | `<FloatingNavbarClient isScrolled={isScrolled} />` |
| `MainNav` | `components/navbar/main-nav.tsx` | Alternate desktop navigation built on `NavigationMenu`. | Use only where that Radix menu variant is intended. | Do not mix with `FloatingNavbar` on the same page. | none. | `<MainNav />` |
| `MobileNav` | `components/navbar/mobile-nav.tsx` | Older sheet/accordion mobile nav. | Legacy mobile nav experiments only. | Prefer current mobile behavior in `FloatingNavbarClient`. | none. | `<MobileNav />` |
| `InfoCardBlock` | `components/navbar/nav-card.tsx` | Shared nav resource/info card. | Navigation dropdown card items. | Blog post cards or article cards. | `title`, optional `subtitle`, `href`, optional `icon`, `badge`, `backgroundImage`. | `<InfoCardBlock title="Docs" href="/docs" />` |
| `GitHubStars` | `components/navbar/github-stars.tsx` | GitHub star pill link with live count. | Header/nav CTA cluster. | Non-nav cards or generic badges. | optional `className` (currently unused). | `<GitHubStars />` |
| `Vscode` | `components/navbar/vscode-number.tsx` | VS Code installs pill link with live count. | Header/nav CTA cluster. | Generic badge or stats cards. | optional `className` (currently unused). | `<Vscode />` |

## UI Primitives (`components/ui`)

| Name | File | Purpose | When to use | When NOT to use | Props summary | Example |
| --- | --- | --- | --- | --- | --- | --- |
| `Button` | `components/ui/button.tsx` | Repo CTA/button primitive with variants and focus-visible states. | CTAs, icon buttons, nav buttons. | Do not create another branded button without a strong reason. | Standard button attrs + `variant`, `size`, optional `asChild`. | `<Button asChild><Link href="/signin">Sign in</Link></Button>` |
| `Card` family | `components/ui/card.tsx` | Base card shell with header/content/footer helpers. | Nav cards and generic card shells. | When `PostCard` already solves the use case. | Standard div attrs on `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. | `<Card><CardContent>...</CardContent></Card>` |
| `Accordion` family | `components/ui/accordion.tsx` | Radix accordion wrapper. | Mobile nav sections and collapsible grouped content. | Simple show/hide content where the custom `Collapsible` is enough. | Radix accordion props on `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`. | `<Accordion type="single" collapsible>...</Accordion>` |
| `Sheet` family | `components/ui/sheet.tsx` | Radix dialog-based sliding sheet. | Mobile menus or side panels. | Tooltip/popover/dropdown behavior. | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetTitle`, etc.; `SheetContent` adds `side`. | `<Sheet><SheetTrigger asChild>...</SheetTrigger><SheetContent side="left" /></Sheet>` |
| `NavigationMenu` family | `components/ui/navigation-menu.tsx` | Radix navigation menu wrapper with glassmorphism dropdowns. | Structured desktop nav menus. | Simple link groups or article TOC. | Menu/list/item/content/trigger/link/indicator/viewport. | `<NavigationMenu><NavigationMenuList>...</NavigationMenuList></NavigationMenu>` |
| `Collapsible` family | `components/ui/collapsible.tsx` | Lightweight local collapsible with context and `aria-expanded`. | Mobile dropdown blocks in `FloatingNavbarClient`. | Complex dialog/menu interactions already covered by Radix. | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`. | `<Collapsible open={open} onOpenChange={setOpen}>...</Collapsible>` |

## Author and Directory Components

| Name | File | Purpose | When to use | When NOT to use | Props summary | Example |
| --- | --- | --- | --- | --- | --- | --- |
| `AuthorHero` | `components/AuthorHero.tsx` | Author detail page hero with avatar, bio, LinkedIn. | `/authors/[slug]` top section. | Compact author metadata. | `name`, `avatarUrl`, `description`, optional `linkedIn`. | `<AuthorHero name={author.name} avatarUrl={author.avatar} description={author.description} />` |
| `PostByAuthorMapping` | `components/postByAuthorMapping.tsx` | Author page composition with hero and post grid. | Author detail pages. | Generic feed sections. | `filteredPosts`, `Content`. | `<PostByAuthorMapping filteredPosts={posts} Content={content} />` |
| `AuthorMapping` | `components/AuthorMapping.tsx` | Paginated author directory grid. | Authors index page. | Use author cards inside articles; this is a directory list. | `AuthorArray`, optional `itemsPerPage`. | `<AuthorMapping AuthorArray={authors} itemsPerPage={8} />` |
| `ReviewingAuthor` | `components/ReviewingAuthor.tsx` | Legacy reviewer details card with expandable description. | Legacy reviewer sections only. | Prefer `AuthorCard` in new work. | `name`, `avatar`, `description`. | `<ReviewingAuthor name={n} avatar={img} description={bio} />` |
| `author-description` | `components/author-description.jsx` | Legacy author details block. | Only when preserving old author page behavior. | Prefer `AuthorHero` and `AuthorCard`. | similar author fields from content extraction. | `<AuthorDescription ... />` |

## Marketing / Utility Components

| Name | File | Purpose | When to use | When NOT to use | Props summary | Example |
| --- | --- | --- | --- | --- | --- | --- |
| `NotFoundPage` | `components/NotFoundPage.tsx` | Rich 404 page with search and post suggestions. | `pages/404.tsx`. | Generic empty states. | optional `latestPosts`, `communityPosts`, `technologyPosts`. | `<NotFoundPage latestPosts={...} />` |
| `SubscribeNewsletter` | `components/subscribe-newsletter.tsx` | Sticky newsletter form with GSAP animation. | Newsletter/signup side widgets. | Generic contact or auth forms. | `isSmallScreen`. | `<SubscribeNewsletter isSmallScreen={false} />` |
| `AdSlot` | `components/Adslot.tsx` | Google AdSense slot wrapper with loading shimmer. | Ad placements. | Content cards or house CTAs. | `slotId`, optional `className`, `layout`, `layoutKey`, `format`, `fullWidthResponsive`. | `<AdSlot slotId="12345" className="my-6" />` |
| `PageLoader` | `components/PageLoader.tsx` | Full-screen route transition loader. | Already used by `_app.tsx`. | Inline loading placeholders. | none. | `<PageLoader />` |
| `PrismLoader` | `components/prism-loader.tsx` | Legacy Prism highlighter bootstrapper. | Only if Prism-based rendering is restored. | Current article code blocks use CodeMirror. | none. | `<PrismLoader />` |
| `Alert` | `components/alert.tsx` | Preview/legacy example alert bar. | Preview mode only. | Normal production UI. | `preview`. | `<Alert preview={preview} />` |
| `Intro` | `components/intro.tsx` | Minimal legacy blog intro section. | Legacy example/blog landing pages. | Current Keploy home page hero. | none. | `<Intro />` |
| `WaitlistBanner` | `components/waitlistBanner.jsx` | Waitlist image CTA link. | Specific campaign placements. | Standard buttons/cards. | none. | `<WaitlistBanner />` |

## Usage Notes

- Prefer `PostCard` + `PostGrid` for anything that is "a list of blog posts."
- Prefer `PostHeader` + `PostBody` for anything that is "a blog article page."
- Prefer `Button`, `Card`, `Accordion`, `Sheet`, `NavigationMenu`, and
  `Collapsible` instead of hand-rolled interactive primitives.
- Treat `PostPreview`, `TagsPostPreview`, `ReviewingAuthor`,
  `author-description`, and `MobileNav` as legacy unless a PR is already
  modifying those files.
