# Resource library and private inbox

The public library lives at `/resources`, with separate pages for Development, AI & agents, Design, Marketing, Ideas & inspiration and Infrastructure. The logo/name returns to `/`.

Open `/resources/inbox` and sign in using the owner password. Choose Add resource to paste a link (or up to 50 lines), upload an image/audio/video/PDF, or import a JSON/Chrome HTML bookmark export. Add a folder, type, description, comma-separated tags and optional private notes. Every new item starts as a draft. Review & edit, then Publish. Published entries can be moved back to the inbox before editing. Private notes never enter public API responses.

Search understands aliases such as `db`, `images`, `audio` and Spanish equivalents. X URLs are canonicalized, and their official embeds load on demand with an original-post fallback. X articles open on X for full reading. Uploads accept at most 4 MiB; save a source link for larger videos. Images are validated and re-encoded to WebP; active SVG/HTML uploads are rejected.

## Production configuration

Netlify is the existing host. `RESOURCE_STORAGE=netlify` uses the site-wide `portfolio-resource-library` Blobs store with strong reads and conditional writes. Entries and media persist independently of deployments. The store is never exposed directly: routes check publication status and owner access. Unknown production hosts fail closed rather than writing to ephemeral disk.

`RESOURCE_ADMIN_PASSWORD` must be at least 16 characters. Set it through Netlify environment variables, never in source or a public variable. Rotating it invalidates existing eight-hour signed sessions. Cookies are HTTP-only, HTTPS Secure and SameSite Strict; mutations require the matching browser origin. Login throttling is in-memory per server instance; the generated owner secret is high entropy. This is a single-owner inbox, not a multi-user authentication service.

Local preview can use `RESOURCE_LOCAL_OWNER=1` in ignored `.env.local`. This bypass only applies to loopback requests and is disabled by hosted-platform signals. Local records/files live in ignored `.resource-data/`, with private file permissions. Never enable this flag on a host.

Export links downloads private JSON including notes, suitable for re-import as drafts. It does not back up uploaded bytes; retain originals. No delete feature is included in this release. The initial curated catalogue remains source-controlled; newly captured resources are managed in the inbox.

## Acceptance

`npm run build` runs unit tests, a production Next build, then an isolated HTTP gate covering login, cross-origin writes, private/public serialization, publishing, unpublishing, upload validation, media authorization, stale updates, URL corrections, duplicate capture and throttling. Node 24 is selected in `netlify.toml`.

Observed locally: 18 unit tests and 41 API assertions passed. Typecheck, targeted ESLint and whitespace checks passed. A same-origin request failed first because Next normalized the loopback URL to localhost; the fix compares the browser-facing Host authority. Probe tests also failed first for duplicate URL edits/capture, attachment type changes and caller-controlled throttle headers, then passed after validation fixes. Browser checks covered link capture, X embed, logo navigation and 320/1440px layouts. External X embed availability remains controlled by X.

The first hosted build exposed a local-store test inheriting Netlify environment flags. The exact hosted environment reproduced `MissingBlobsEnvironmentError`; the fixture now selects and restores its isolated local-store environment. Production storage selection is unchanged, and the hosted-fallback rejection assertions remain enabled.

## Font build reliability

A clean hosted build reproduced Next/Turbopack’s `next/font/google queries have exactly one entry` error on Bodoni Moda’s extensionless Google font URL. Clearing the cache was insufficient: Google can vary that response. The same Bodoni Moda, Manrope and Geist Mono variable fonts are bundled as WOFF2 with their OFL licenses, including Spanish glyphs. `next/font/local` preserves the CSS variables and avoids build-time font downloads. Sources: https://github.com/vercel/next.js/issues/99114 and https://github.com/google/fonts/tree/main/ofl.

The font regression gate requests every font preloaded by the built homepage and validates its WOFF2 signature. Four bundled fonts passed, including both Bodoni styles. Browser inspection confirmed the same font families and no horizontal overflow.

## Native upload packaging

The first live inbox request failed before storage access: Next’s deployment trace omitted Sharp 0.35’s `libvips` shared library. A bundle probe reproduced the missing native library and found local-only files in a local build trace. Explicit tracing includes the installed native library and excludes `.resource-data`, `.env*`, `.git` and `tmp` on every server route. The release gate validates the trace before running the HTTP assertions. This avoids downgrading the image validator or weakening upload checks. Source: https://github.com/vercel/next.js/issues/97973.

## Missing-object cloud regression

Production saves stalled on the first missing-record lookup. A nonexistent media read also timed out. Stage logs located the wait at `getEntry`; SDK source showed it awaited cancellation of a 404 body while Next’s deduplicating fetch retained an unread clone. A real Next server against a local mock Blobs 404 reproduced the timeout before the fix. Blobs fetches now use `no-store` and a bounded abort signal, which opts out of Next’s response cloning. The cloud gate checks prompt missing-media and owner-edit responses. Temporary stage diagnostics were removed after identifying the cause.
