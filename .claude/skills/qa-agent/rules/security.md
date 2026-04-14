# Security Rules

1. No hardcoded secrets, API keys, tokens, passwords, or bearer secrets in committed source, config, workflows, or tests.

2. `NEXT_PUBLIC_` variables must be truly public.
   - Never expose credentials, refresh tokens, preview secrets, or admin-only endpoints to the client.
   - Review `next.config.js`, `pages/_app.tsx`, and any client-side fetch code carefully.

3. `dangerouslySetInnerHTML` requires trusted or sanitized content.
   - JSON-LD script injection in `components/meta.tsx`, `components/layout.tsx`, and `pages/_document.tsx` is acceptable because it serializes locally constructed objects.
   - Any HTML derived from user or CMS content must be sanitized or tightly controlled before injection.

4. No `eval()` or `new Function()` usage.

5. Redirect targets and external proxy URLs must be allowlisted.
   - Follow the validation pattern in `pages/api/proxy-image.ts`.
   - Preview redirects must not trust arbitrary request targets, following `pages/api/preview.ts`.

6. Cookies or preview tokens carrying auth state must use secure framework helpers or secure flags where applicable.

7. No SQL or query string interpolation into backend databases or remote admin APIs.
   - If a new data store is added, use parameterized queries only.

8. File uploads or fetched blobs must be validated server-side for type and size before use or storage.

9. No `console.log` of user data, secrets, auth tokens, or raw API errors that might include sensitive payloads.

10. Client-side `fetch()` calls must not expose server-only credentials.
    - Review `hooks/`, `components/`, and `pages/` for accidental leakage.

11. External script additions require justification and least privilege.
    - This repo already loads analytics and telemetry scripts in `components/layout.tsx` and `pages/_app.tsx`; new additions should be treated as a security and performance decision.
