Lightweight MQL capture mechanisms directly into the blog, targeted at the posts that already have the audience.

Instead of generic "sign up" CTAs that readers ignore, we identify what the reader is already interested in (based on which blog they're reading) and offer them something relevant in exchange for an email. That email goes into the nurture pipeline and eventually converts to a platform signup.

## What's planned

A few different conversion surfaces we're building toward:

- **Gated reports** - show a preview of a relevant report/guide inside the blog, blur the rest, and ask for an email to receive the full thing.
- **Keyword tooltips** - highlight specific high-intent keywords in the blog content; hovering opens a tooltip with a short demo and a CTA.
- **Reading progress CTAs** - contextual slide-ins triggered at scroll depth, copy tied to the specific blog topic (still ideating).
- **Inline assessments** - short quizzes ("how mature is your testing setup?") that gate the result behind an email (still ideating).

## What's in this PR

### Gated report

- A fixed-height scrollable container renders a screenshot of the report, clipped to look like a document you're paging through.
- Trimming the container height is what creates the illusion - it stops feeling like an image and starts feeling like a real report.

<img width="1221" height="721" alt="Screenshot 2026-06-18 at 3 05 57 PM" src="https://github.com/user-attachments/assets/ca77000e-57a8-417d-83b9-4c97a3ddb4a7" />

- At the bottom of the image, a frosted-glass overlay fades in with `backdrop-filter: blur` and a gradient that bleeds into the image rather than sitting below it as a separate box.
- The CTA floats on top of that: title, email input, submit.

> We went with a screenshot instead of an actual PDF embed (`react-pdf` and similar) deliberately. A PDF renderer adds bundle weight and mobile layout headaches. A well-cropped image gets you the same visual effect at a fraction of the cost.

The injection is config-driven (`config/gated-reports.ts`) - you pick which blog slug and after which heading it appears. No code changes needed to roll it out to a new blog, just a new entry in the config. Currently live on `api-testing-tools` after the "How to Choose the Right API Testing Tool" section.

**How we decide which blog and where** - blog selection is based on traffic and topic relevance; we pick posts where the report is a natural extension of what the reader is already looking for. Placement is after a specific heading in that post, chosen to be the point where the reader has enough context to find the report valuable. To configure this in code, add an entry to `config/gated-reports.ts`:

```ts
{
  blogSlug: "api-testing-tools",
  afterHeading: "How to Choose the Right API Testing Tool",
  preview: {
    imageSrc: "/blog/report-preview.png",
    alt: "API Testing Tools Report preview",
  },
  title: "Get the Full API Testing Report",
  reportId: "api-testing-report-2024",
}
```

Email submission endpoint is stubbed (`pages/api/request-report.ts`) and ready to be wired to HubSpot or Mailchimp - that's a follow-up once we validate the component is converting.

---

### Keyword tooltips

Highlights specific high-intent keywords inside a blog post. Hovering over a keyword opens a small card above it with a product demo video, a short heading, and a CTA.

The challenge here is that blog content arrives as raw HTML from WordPress and gets rendered via `dangerouslySetInnerHTML` - you can't inject React components inline into that. The approach: before the HTML hits the DOM, we replace the target keyword text with a `<span data-tt-key="...">` wrapper. A separate portal component (`KeywordTooltipLayer`) runs alongside the post body, listens for `mouseover`/`mouseout` on those spans via event delegation, and renders the tooltip card via `createPortal` into `document.body`. The tooltip is `position: fixed`, anchored to the keyword's `getBoundingClientRect()`.

Hover behavior was a UX problem worth calling out: moving the mouse from the keyword to the tooltip card passes through a gap, so a naive `mouseout` close would kill the tooltip before you get there. The fix: tooltip opens and starts a 2s auto-close timer. If the mouse reaches the panel within that window, the timer cancels and the panel stays open until the mouse leaves. This makes the interaction feel stable.

Config lives in `config/keyword-tooltips.ts`:

```ts
{
  key: "white-box-captured-traffic",
  blogSlug: "white-box-testing",
  keyword: "captured production traffic",
  media: {
    type: "video",
    src: "https://keploy-devrel.s3.us-west-2.amazonaws.com/landing/load+testing.mp4",
  },
  heading: "Real traffic. Real tests. Zero manual effort.",
  ctaText: "Try Keploy Free →",
  ctaHref: "https://app.keploy.io/signin",
}
```

Currently live on `white-box-testing` for two keywords: `captured production traffic` and `measurable quality signals`. Adding a new keyword to any blog is one config entry, no code changes.
