# On-demand revalidation

## Why this exists

Every page in this app is statically generated (ISR). Freshness used to come
from *time-based* revalidation — `revalidate: 10` on technology posts and the
listing pages, `revalidate: 60` on community posts.

That is the wrong mechanism for a blog. Each time a page's window expired, the
next request served a stale copy and fired a background regeneration, and each
regeneration is a full serverless invocation costing ~3.5s of WordPress
round-trips:

| Query | Time |
| --- | ---: |
| `getPostAndMorePosts` | 1488 ms |
| `getMoreStoriesForSlugs` | 1083 ms |
| `getReviewAuthorDetails("neha")` | 383 ms |
| `getReviewAuthorDetails("Jain")` | 889 ms |
| **total** | **~3.5 s** |

Across ~520 posts under crawler traffic that was roughly 1.2M renders and
**2,224 GB-Hrs** of Vercel function duration per billing period — almost all of
it re-fetching content that had not changed.

WordPress content changes a few times a week, not every 10 seconds. So
regeneration is now driven by *events*, not by a timer: WordPress calls
`/blog/api/revalidate` when a post actually changes, and the ISR TTLs in
`lib/isr.ts` are just a 24h safety net.

## Setup

### 1. Vercel

Add a project environment variable:

```
REVALIDATE_SECRET=<a long random string>
```

Generate one with `openssl rand -hex 32`. The endpoint fails closed — if this
is unset it returns 500 rather than allowing unauthenticated regeneration.

### 2. WordPress

Save the file below as
`wp-content/mu-plugins/keploy-revalidate.php` on `wp.keploy.io`. `mu-plugins`
(must-use) load automatically and cannot be deactivated from the admin UI by
accident.

Then add the matching secret to `wp-config.php`:

```php
define('KEPLOY_REVALIDATE_SECRET', '<the same value as REVALIDATE_SECRET>');
define('KEPLOY_REVALIDATE_ENDPOINT', 'https://keploy.io/blog/api/revalidate');
```

```php
<?php
/**
 * Plugin Name: Keploy Blog On-Demand Revalidation
 * Description: Pings the Next.js blog so it regenerates pages the moment
 *              content changes, instead of polling on a timer.
 */

defined('ABSPATH') || exit;

/**
 * Ping the blog for a single post.
 *
 * Sent non-blocking so saving a post in the editor is never slowed down by
 * page regeneration (which can take a few seconds per page). Delivery failures
 * are therefore not visible here — they surface in the Vercel function logs,
 * and the 24h ISR safety net in lib/isr.ts backstops anything genuinely lost.
 */
function keploy_ping_revalidate($post) {
    if (!($post instanceof WP_Post) || $post->post_type !== 'post') {
        return;
    }

    if (!defined('KEPLOY_REVALIDATE_SECRET') || !defined('KEPLOY_REVALIDATE_ENDPOINT')) {
        error_log('[keploy-revalidate] KEPLOY_REVALIDATE_SECRET / _ENDPOINT not defined in wp-config.php');
        return;
    }

    // WordPress appends "__trashed" to post_name when a post is trashed. The
    // blog still knows the page by its original slug, so strip the suffix.
    $slug = preg_replace('/__trashed$/', '', $post->post_name);
    if ($slug === '') {
        return;
    }

    $body = array('slug' => $slug);

    // Only the two categories the blog actually routes on. If the post is in
    // neither (or is moving between them), omit `category` and the endpoint
    // will revalidate both URLs — which is what makes a category change work.
    $slugs = wp_get_post_categories($post->ID, array('fields' => 'slugs'));
    foreach (array('community', 'technology') as $category) {
        if (in_array($category, $slugs, true)) {
            $body['category'] = $category;
            break;
        }
    }

    // Tag and author pages are ALSO behind the 24h safety net, so a publish
    // that doesn't refresh them leaves the new post missing from those
    // listings for a full day. Send them so the endpoint can target them.
    $tags = wp_get_post_tags($post->ID, array('fields' => 'names'));
    if (!is_wp_error($tags) && !empty($tags)) {
        $body['tags'] = array_slice($tags, 0, 20);
    }

    // PublishPress Multiple Authors (ppmaAuthorName) is the display author the
    // blog routes on; fall back to the WP account only if it isn't available.
    $author = '';
    if (function_exists('get_multiple_authors')) {
        $authors = get_multiple_authors($post->ID);
        if (!empty($authors) && !empty($authors[0]->display_name)) {
            $author = $authors[0]->display_name;
        }
    }
    if ($author === '') {
        $author = get_the_author_meta('display_name', $post->post_author);
    }
    if ($author !== '') {
        $body['author'] = $author;
    }

    wp_remote_post(KEPLOY_REVALIDATE_ENDPOINT, array(
        'timeout'  => 5,
        'blocking' => false,
        'headers'  => array(
            'Content-Type'        => 'application/json',
            'x-revalidate-secret' => KEPLOY_REVALIDATE_SECRET,
        ),
        'body'     => wp_json_encode($body),
    ));
}

/**
 * Fires on publish, update, unpublish and trash.
 *
 * transition_post_status covers every status change in one hook, so an
 * unpublish correctly turns the live page into a 404 instead of leaving the
 * last good render cached for 24h.
 */
function keploy_revalidate_on_transition($new_status, $old_status, $post) {
    // Ignore autosaves/revisions and no-op transitions.
    if (wp_is_post_revision($post->ID) || wp_is_post_autosave($post->ID)) {
        return;
    }
    if ($new_status === $old_status && $new_status !== 'publish') {
        return;
    }
    // Only care if the post is, or just stopped being, publicly visible.
    if ($new_status !== 'publish' && $old_status !== 'publish') {
        return;
    }

    keploy_ping_revalidate($post);
}
add_action('transition_post_status', 'keploy_revalidate_on_transition', 10, 3);

/** Permanent deletion doesn't go through transition_post_status. */
function keploy_revalidate_on_delete($post_id) {
    $post = get_post($post_id);
    if ($post) {
        keploy_ping_revalidate($post);
    }
}
add_action('before_delete_post', 'keploy_revalidate_on_delete');
```

## Verifying

Trigger a revalidation by hand:

```bash
curl -X POST https://keploy.io/blog/api/revalidate \
  -H 'content-type: application/json' \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -d '{"slug":"what-is-api-testing","category":"community"}'
```

A success returns `{"revalidated": true, "results": [...]}` with one entry per
regenerated path — the post itself plus `/blog`, both category listings, both
search pages, the tag and author indexes, and any tag/author pages named in the
request.

Individual paths can report `revalidated: false` without the request failing —
that is expected when a slug legitimately doesn't exist in one of the two
categories. Only an all-paths failure returns a 500.

Then confirm the page actually re-rendered:

```bash
curl -sI https://keploy.io/blog/community/what-is-api-testing | grep -i x-vercel-cache
# x-vercel-cache: HIT   (age resets to ~0 right after a revalidation)
```

### Verify the API cache headers on the preview deployment

`vercel.json` previously forced `no-store` on all of `/blog/api/(.*)`; it is now
scoped to `preview|exit-preview|revalidate` so the read-only data routes can be
served from the edge. Those routes set their own `Cache-Control` in the handler
(and `no-store` on their error paths).

What is NOT established from the repo alone is which value wins when a
`vercel.json` header rule and a handler's `res.setHeader` set the same key —
`/blog/api/search-all` also matches the blanket `/blog/(.*)` rule. Check it on
the preview URL before merging:

```bash
curl -sI https://<preview>.vercel.app/blog/api/search-all | grep -i cache-control
# want: public, s-maxage=3600, stale-while-revalidate=86400
```

If the blanket rule wins instead, add an explicit `/blog/api/(search-all|nav-latest|proxy-image)`
entry to `vercel.json` with those values.

## Gotchas

- **Paths must include the `/blog` basePath.** `res.revalidate()` is not a
  route lookup; on Vercel it performs a real `fetch('https://' + host + path)`.
  A path without the basePath silently 404s and revalidates nothing. This is
  why `lib/isr.ts` exports `BASE_PATH`/`postPath()` rather than hand-writing
  paths at each call site, and why `tests/lib/isr.test.ts` pins it to
  `next.config.js`.
- **Don't lower the TTLs in `lib/isr.ts` to "fix" staleness.** That reintroduces
  exactly the cost this removed. If content is stale, the webhook is broken —
  check the Vercel function logs for `/api/revalidate`.
