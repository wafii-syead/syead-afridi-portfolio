# Verification — 2026-11-05

- Production build passed; final source is rebuilt by the publication helper.
- TypeScript checks passed.
- Desktop orbital showcase, animation pause, featured-project navigation, category filters and native project dialogs exercised in the browser.
- Mobile preview at 390px checked, including menu navigation and about content. The body had no horizontal overflow after correcting the hero headline and contact arrow.
- Contact form submitted through the browser; success state shown and stored enquiry verified in D1 through the owner API.
- Anonymous inbox reads, admin project reads, project writes and image uploads rejected.
- Invalid contact data and unsafe project URLs rejected.
- Owner project edits persisted; hidden projects disappeared from public responses; original project restored after test.
- Inbox status update persisted.
- Invalid image bytes rejected; valid JPEG saved to R2 and retrieved through the media API.
- Disposable verification pages removed before publication. Test data exists only in ignored local preview storage.
- Automatic email notifications are not configured; enquiries are stored in the protected studio inbox.
