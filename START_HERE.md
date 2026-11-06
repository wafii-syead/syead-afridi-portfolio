# Start here — Syead Afridii Portfolio

This ZIP contains the complete frontend and backend source, project artwork, database migrations, dependency lockfile and build tooling.

## Requirements

- Node.js 22.13 or newer, with npm.
- Extract the entire folder before running commands.
- Use a terminal in the extracted `syead-afridii-portfolio` folder.

## Run on your computer

1. Install dependencies:

   ```sh
   npm ci
   ```

2. Make a copy of `.dev.vars.example` named `.dev.vars` in the project root. Its sample email belongs to the starter's local test account; it is not a production credential.

3. Build once to generate the local database configuration:

   ```sh
   npm run build
   ```

4. Initialize the local database. Run this command once for a new local database:

   ```sh
   node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_next_leo.sql
   ```

5. Start development:

   ```sh
   npm run dev
   ```

6. Open the localhost URL printed by the terminal (normally http://localhost:5173).

7. For the admin dashboard, open `/admin` and select **Sign in to your studio**. Local development uses the starter's simulated account `seedy@sites.test`. Real production sign-in is handled separately by ChatGPT Sites.

Contact submissions, project changes and uploaded images in this mode are stored in local development storage. They are separate from the live website's database and uploads.

## What to edit

- `app/portfolio.tsx`: main portfolio page and interactions.
- `app/globals.css`: responsive styling.
- `app/orbit.tsx`: animated orbital artwork.
- `app/data.ts`: starter projects, social links and curated articles.
- `app/admin/`: owner dashboard.
- `app/api/`: contact, projects, inbox and image-upload API routes.
- `db/schema.ts` and `drizzle/`: database schema and migrations.
- `public/assets/`: images, logos and local fonts.
- `ASSET_SOURCES.json`: artwork provenance.

## Production hosting

The existing deployed website is https://syead-afridii-studio.sunlitmarmalade1.chatgpt.site.

This is a Vinext/React application with a Cloudflare Workers backend, D1 database and R2 image storage. It is not a static HTML-only site or a PHP/MySQL project. The production sign-in flow relies on ChatGPT Sites.

`.openai/hosting.json` retains the identifier for your existing Site. Keep it when continuing that same Site. A separate new Site needs its own registration and hosting configuration. Do not expose the admin dashboard by removing authorization checks when moving to another host; configure equivalent trusted authentication and storage first.

The production ADMIN_EMAIL secret must match the authorized owner's real signed-in account. No production secret, login cookie, live enquiry database, uploaded user files or Git credentials are included in this ZIP. Set production secrets through the hosting settings.

Enquiries save to the admin inbox. Automatic email notifications are not configured; the dashboard's email reply button opens your email application.

## Included / excluded

Included: frontend, backend, images, fonts, migrations, package.json, package-lock.json, configuration and instructions.
Excluded: node_modules, generated builds, Git history, private runtime settings, live data and temporary test pages. `npm ci` recreates dependencies.

See README.md and VALIDATION.md for implementation and verification details.
