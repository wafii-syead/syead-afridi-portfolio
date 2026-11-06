# Syead Afridii — Creative Portfolio

A responsive portfolio with procedural 3D-style orbital artwork, category filters, project detail dialogs, a journal, contact enquiries and an owner-only studio.

## Application

- Vinext / React frontend and Cloudflare Worker API
- D1 stores project overrides, enquiries and bounded submission counters
- R2 stores uploaded cover images
- Sites sign-in + server-side ADMIN_EMAIL allowlist protect every studio endpoint
- Public page at / and studio at /admin
- Accessible native dialogs, keyboard navigation, reduced-motion support and responsive layouts

## Studio

Sign in with the account that owns this Site. The deployment secret ADMIN_EMAIL must match that account. Use Projects to add, edit, feature or hide projects. Image uploads accept JPEG, PNG and WebP up to 6 MB. Use Inbox to read, archive or open an email reply.

Contact messages persist in D1. No automatic email delivery or notification service is configured. Do not imply a form sent an email.

## Development

Use the supplied Sites workflow. Run npm run db:generate for schema changes. Local and production databases are separate. See the maintained starter instructions for local D1 migrations and build tooling. Never replay applied migrations.

Source data lives in app/data.ts. Persisted project entries override the matching default id; hidden projects retain their entries. Featured journal posts are curated in app/data.ts. Source image provenance is in ASSET_SOURCES.json. The original Behance profile is a wordmark, not a face portrait. The Tanim project tile is a typographic presentation of the website project, not a screenshot.

This Site is initially owner-private. Public access, when requested, is managed through Sites; the admin allowlist must remain in place. User-provided GitHub dashboard link is intentionally omitted because it is not a public portfolio identity.

## Validation

Run npx tsc --noEmit and the Sites build helper. Exercise contact submission, validation, stored inbox retrieval, project persistence, unauthenticated rejection and upload validation against the local preview before publishing.
