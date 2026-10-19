# Bhojpuri AI Music Generator — Requirements Specification

Oct 19, 2026 · Vijay Gautam, Shipsar Developers

## 1. Project overview

We will build a MERN-stack website with three AI music features, credits, Razorpay payments and an admin panel, for a fixed **₹65,000** over **28 working days**, with the product submitted by 30 November 2026. Hosting, business email, domain and all AI or payment usage fees are paid by the client, on accounts in the client's own name.

**Change in this revision:** at the client's request, all three features now use one provider, the **Mureka API** (api.mureka.ai). Mureka is the client's choice; output quality from Mureka is accepted by the client and is not a developer defect. Google Lyria, MusicGPT, the self-hosted htdemucs\_6s worker and Modal.com are removed. Open Studio and Audio Colour/visualizer are removed from scope: users get one dashboard to generate songs from text, make similar songs from their own audio, and download any song as a single MP3 or as stems.

| # | Feature | Engine | User gives | User gets |
| --- | --- | --- | --- | --- |
| 1 | Text prompt to Bhojpuri music | Mureka `POST /v1/song/generate` (lyrics to song) | Prompt, lyrics, genre, mood, vocals, BPM, taal, instruments | 1 full song per request, MP3 |
| 2 | Audio to similar music, new lyrics | Mureka `POST /v1/song/remix` | A reference song, new lyrics, style prompt | 1 new version per request, MP3 |
| 3 | Download as single or stems | Mureka `POST /v1/song/stem` (audio-separation-2), stems only | Download → Single or Stems on a song from Feature 1 or 2 | Single: one MP3. Stems: up to 12 (vocals, bass, drums, guitar, piano, keyboard, strings, flute, brass and woodwinds, synth, FX, other) |

All three features share one account, one credit balance, one job queue and one "My Songs" library.

**Document status:** pre-contract draft for client review. Once signed, it replaces the earlier ₹50,000 Basic MVP scope and the earlier Lyria/MusicGPT/htdemucs draft wherever they differ. Items still open are listed in section 8.

## 2. Tech stack and architecture

The website pages run on Vercel and the back end on one Hostinger KVM 1 server; the AI engine (Mureka), database, file storage and payments are outside services. No AI model runs on the VPS, so the server only does web, queue and light audio conversion work.

**Flow:** browser → Vercel (React) → VPS API (Express) → Redis queue → Mureka worker → Mureka API → results copied to Cloudflare R2 → My Songs.

Every generation goes through the Redis queue. The worker never sends more jobs to Mureka at the same time than the client's Mureka concurrency allows (1 on the Trial, 5 on Basic; stem jobs always 1), so many users can press "Generate" at once without errors; extra jobs wait in the queue (risk R-1).

| Layer | Technology |
| --- | --- |
| Frontend | React with Tailwind CSS, hosted on Vercel |
| Backend | Node.js with Express; email and Google sign-in (OAuth) |
| Database | MongoDB Atlas (Mongoose), free tier |
| Job queue | Redis with BullMQ, with a concurrency limit per Mureka job type |
| Feature 1 engine | Mureka `/v1/song/generate`, model set by admin (default `mureka-9.5`) |
| Feature 2 engine | Mureka `/v1/files/upload` (purpose `remix`) then `/v1/song/remix` |
| Feature 3 engine (stem download) | Mureka `/v1/song/stem`, model `audio-separation-2` (admin can switch to `audio-separation-1`) |
| Task status | Polling `/v1/song/query/{task_id}` from the worker |
| Audio conversion | FFmpeg on the VPS: WAV stems to MP3, upload checks |
| File storage | Cloudflare R2 (S3-compatible) |
| Payments | Razorpay Subscriptions and Orders, with webhooks |
| Server | Hostinger KVM 1, Ubuntu, Docker, Nginx, free SSL |
| Email sending | From the client's official business email address, via SMTP (Brevo, Resend or the Hostinger mailbox) |

## 3. Functional requirements

Each requirement has an ID so the contract, testing and change requests can refer to it. "Must" items are in the ₹65,000 scope; "Should" items are included if time allows and never block acceptance.

### 3.1 Public website and authentication

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-1.1 | Landing page explaining the three features, with sample audio and a call to action; all text, logo and brand colours supplied by the client | Must |
| FR-1.2 | Pricing page showing subscription plans and credit packs | Must |
| FR-1.3 | Sign up with name, email and password | Must |
| FR-1.4 | Email verification link before first generation | Must |
| FR-1.5 | Log in, log out, and "remember me" session | Must |
| FR-1.6 | Forgot password by emailed reset link that expires in 30 minutes | Must |
| FR-1.7 | Terms of Service, Privacy Policy, Refund Policy and Contact pages (needed for Razorpay approval; client supplies the text) | Must |
| FR-1.8 | Sign up and log in with Google | Must |

### 3.2 User dashboard

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-2.1 | Show credit balance, current plan and renewal date | Must |
| FR-2.2 | Dashboard shows the two create options (text to song; audio to similar song) and the five most recent songs, each with Download: Single or Stems | Must |
| FR-2.3 | Profile page to change name and password | Must |

### 3.3 Feature 1: Text prompt to music (Mureka lyrics to song)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-3.1 | Create Song form with language (Bhojpuri, Hindi), genre, mood, vocal type (male, female, instrumental), BPM, taal, instruments, free-text prompt and lyrics box; the genre, mood, taal and instrument lists are supplied by the client | Must |
| FR-3.2 | Each request generates one full song (up to 5 min 30 s), using Mureka `n` = 1; there is no 30-second preview step | Must |
| FR-3.3 | Backend turns the form into a Mureka prompt (up to 1,024 characters) plus lyrics with section tags such as [Verse] and [Chorus]; vocal type maps to Mureka's `gender` field | Must |
| FR-3.4 | Mureka model is an admin setting: V9.5 (default, client instruction), V9, V8 or V7.6 | Must |
| FR-3.5 | Credit check before submit; job is rejected with a clear message if balance is too low | Must |
| FR-3.6 | Job enters the queue and shows status: queued, generating, done, failed | Must |
| FR-3.7 | Mureka failures (including `failed_reason` from Mureka) are shown to the user in plain words, and credits are refunded | Must |
| FR-3.8 | Standard input limits: lyrics up to 2,000 characters, prompt up to 500 characters (Mureka allows 5,000 and 1,024) | Must |
| FR-3.9 | Instrumental choice uses Mureka `/v1/instrumental/generate` instead of lyrics to song | Should |

**Client instruction (R-3):** after the M2 sample test, the client confirms in writing that they accept Mureka's Bhojpuri pronunciation. Bhojpuri is not on Mureka's published language list. The developer does not guarantee exact Bhojpuri pronunciation.

**Client instruction (R-11):** the client has accepted that Tool 1 generates one full song per request and that there is no 30-second preview step. Each request is charged as one full song.

### 3.4 Feature 2: Audio to similar music (Mureka Remix)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-4.1 | Upload a reference track: MP3 or M4A, 10 seconds to 5 min 50 s (350 s), up to 10 MB (Mureka limits) | Must |
| FR-4.2 | Mandatory checkbox: "I own or have the rights to use this audio" | Must |
| FR-4.3 | Inputs: new lyrics (required) and style prompt (required); vocal style is written into the prompt | Must |
| FR-4.4 | Upload to Mureka (purpose `remix`), call Remix, and save and show the user the one returned version (Mureka `n` = 1) | Must |
| FR-4.5 | Uploaded reference audio is deleted from R2 after the job finishes | Must |
| FR-4.6 | Status shown as in FR-3.6 | Must |
| FR-4.7 | Tool page states that instrumental-only songs are not supported (Mureka limit); Mureka's error for such files is shown in plain words with a credit refund | Must |

**Client instruction:** the client has decided that Tool 2 returns one remix version per request (Mureka `n` = 1). Each request is charged as one Mureka Remix song.

### 3.5 Feature 3: Download as single or stems

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-5.1 | Every finished song from Feature 1 or 2 has a Download button with two choices: Single (one MP3) or Stems; there is no separate stem upload | Must |
| FR-5.2 | On the first Stems request for a song, the worker sends a time-limited R2 link of that song to Mureka Stem with model `audio-separation-2`, and receives a ZIP of up to 12 WAV stems (plus a MIDI ZIP) | Must |
| FR-5.3 | Worker downloads the ZIP before its link expires, converts each stem to MP3 with FFmpeg and stores it in R2 | Must |
| FR-5.4 | Each stem playable in the browser and downloadable as MP3, plus Mureka's original WAV stems ZIP and MIDI ZIP | Must |
| FR-5.5 | Stem jobs run one at a time (Mureka limit); waiting users see their queue position | Must |
| FR-5.6 | Stems (MP3, WAV and MIDI) are kept for 30 days, then auto-deleted to control storage; the user is told the delete date | Must |
| FR-5.7 | Admin setting to switch the stem model to `audio-separation-1` (5 stems: vocals, drums, bass, accompaniment, other) to cut cost, with no code change | Must |
| FR-5.8 | Stems are made and charged once per song; later stem downloads of that song are free while the stems are kept | Must |

**Client instruction:** stems are a download option only, for songs made on the site. Stem separation follows Mureka's own defaults: model Separation V2 (up to 12 stems, US$0.70 per song) and output as Mureka gives it (WAV stems and MIDI), with MP3 copies made for in-browser playback. All generated music, songs and stems, is stored for at least 30 days.

### 3.6 Player and My Songs library

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-6.1 | Audio player with play, pause, seek and volume | Must |
| FR-6.2 | MP3 download for every finished output | Must |
| FR-6.3 | My Songs list of all jobs, filterable by feature and status, newest first | Must |
| FR-6.4 | Rename and delete own items | Must |
| FR-6.5 | Job status updates when the user refreshes the page (no live push) | Must |
| FR-6.6 | Simple waveform display in the player | Should |
| FR-6.7 | All Mureka output is copied to R2 when the job finishes, because Mureka links expire after 30 days; songs stay until the user deletes them, and nothing is auto-deleted before 30 days | Must |

### 3.7 Credits and Razorpay payments

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-7.1 | Each feature has a credit cost set by the admin, priced from the Mureka cost (for example: song 3, remix 4, stems 14) | Must |
| FR-7.2 | Credits are reserved on submit, charged on success and refunded automatically on failure | Must |
| FR-7.3 | Credit ledger: every purchase, deduction, refund and admin change with date and reason | Must |
| FR-7.4 | Razorpay subscriptions: monthly plans that add credits on each successful renewal | Must |
| FR-7.5 | Razorpay one-time credit packs | Must |
| FR-7.6 | Credits added only after a verified Razorpay webhook, never from the browser alone | Must |
| FR-7.7 | User can view payment history and cancel a subscription | Must |
| FR-7.8 | Rule for unused subscription credits at renewal (carry over or expire), set in section 8 | Must |
| FR-7.9 | GST invoice PDF per payment | Should |

### 3.8 Admin panel

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-8.1 | Admin login separate from user roles | Must |
| FR-8.2 | User list with search; view a user's jobs, credits and payments; block or unblock | Must |
| FR-8.3 | Add or remove credits manually with a required reason (written to the ledger) | Must |
| FR-8.4 | All jobs list with feature, status, Mureka error and re-run of failed jobs | Must |
| FR-8.5 | Edit plans, credit packs and per-feature credit costs without code changes | Must |
| FR-8.6 | Payments list from Razorpay webhooks | Must |
| FR-8.7 | Overview: new users, jobs per feature per day, failed jobs, estimated Mureka spend | Must |
| FR-8.8 | Remove any user content on a copyright complaint | Must |
| FR-8.9 | Mureka settings: model per feature, stem model, and the concurrency limit to match the client's Mureka purchase | Must |
| FR-8.10 | Show the Mureka account balance (from `/v1/account/billing`) and warn when it falls below a set amount | Must |

### 3.9 Provider adapter layer

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-9.1 | One adapter interface per job type (generate, remix, separate); all three use the Mureka adapter, so a provider can be swapped later per job type | Must |
| FR-9.2 | The Mureka API key is stored only in server environment variables | Must |
| FR-9.3 | A short guide on how to add a new provider adapter | Must |

## 4. Non-functional requirements

These set how well the system must work. Targets apply to the Hostinger KVM 1 setup (1 vCPU, 4 GB RAM) unless the client upgrades.

| ID | Area | Requirement |
| --- | --- | --- |
| NFR-1 | Performance | Website pages load in under 3 seconds on a 4G mobile connection in India |
| NFR-2 | Performance | Non-AI API calls (login, history, dashboard) respond in under 500 ms |
| NFR-3 | Job times | Mureka jobs finish within Mureka's own time (usually a few minutes); the site adds under 30 seconds, including copying files to R2 and stem MP3 conversion |
| NFR-4 | Job times | When more jobs are waiting than the Mureka concurrency allows, the user sees queue position and a time estimate |
| NFR-5 | Capacity | Supports about 500–1,500 registered beta users. Jobs running at the same time equal the Mureka concurrency bought (1 on Trial, 5 on Basic); stem jobs one at a time |
| NFR-6 | Reliability | A failed or timed-out job is retried once, then marked failed with credits refunded |
| NFR-7 | Reliability | Razorpay webhooks are idempotent: the same event can never add credits twice |
| NFR-8 | Reliability | Daily automated database backup to Cloudflare R2, kept for 7 days |
| NFR-9 | Security | Passwords hashed with bcrypt; sessions use secure, httpOnly cookies |
| NFR-10 | Security | All API keys and secrets live only on the server, never in browser code |
| NFR-11 | Security | HTTPS on the whole site; rate limits on login, signup and job submission |
| NFR-12 | Security | Uploads checked for file type, size and length before they are sent to Mureka |
| NFR-13 | Security | Audio files served through time-limited signed links, not public URLs |
| NFR-14 | Scalability | Moving to KVM 2 or a bigger server, or to a larger Mureka purchase, needs no code changes |
| NFR-15 | Portability | Backend and worker packaged with Docker so they run on any Linux server |
| NFR-16 | Compatibility | Works on the latest two versions of Chrome, Safari, Firefox and Edge; responsive from 360 px phone width |
| NFR-17 | Usability | Interface in English only |
| NFR-18 | Maintainability | Source code on GitHub, with README, `.env.example` and a deployment guide |
| NFR-19 | Monitoring | Server and job error logs kept for 14 days; admin sees failed jobs (FR-8.4) and low Mureka balance (FR-8.10) |
| NFR-20 | Legal | Privacy policy and data handling follow India's Digital Personal Data Protection Act, 2023; user can request account deletion |
| NFR-21 | Legal | Site states that outputs are AI-generated |

## 5. Milestones and payment plan

The four milestones total **₹65,000** and **28 working days**, with work starting on 21 October 2026 and the product submitted by 30 November 2026. The dates assume the client signs and shares account access by 21 October, and work continues while each milestone is reviewed; any later start or delay moves them by the same number of working days. Each payment is due only after that milestone is shown on staging and accepted in writing.

| Milestone | What is delivered | Days | Target date | Payment | Share |
| --- | --- | --- | --- | --- | --- |
| M1 — UI, frontend, login, dashboard | Landing, pricing and legal pages; email and Google signup and login, verification, forgot password; dashboard with both create options and the Single/Stems download | 10 | 3 Nov 2026 | ₹23,000 | 35% |
| M2 — Backend, database, Mureka integration | MongoDB schema; provider adapter layer; Redis job queue with Mureka concurrency limits; Mureka song generate, remix and stem connected; R2 copy and FFmpeg stem conversion; basic security; 10 sample Bhojpuri songs | 7 | 12 Nov 2026 | ₹16,000 | 25% |
| M3 — Generation, history, download, credits, payments | All flows working end to end; status on refresh; player; MP3 and ZIP download; My Songs; credit ledger with auto refund; Razorpay plans and packs with webhooks | 5 | 19 Nov 2026 | ₹11,000 | 17% |
| M4 — Admin, testing, deployment, handover | Admin panel (FR-8) including Mureka settings and balance; testing of agreed flows; deployment on client accounts; deployment guide; source code and repository handover; 15-day bug-fix support starts | 6 | 27 Nov 2026 | ₹15,000 | 23% |
| **Total** |  | **28** | Product submitted by 30 Nov 2026 | **₹65,000** | **100%** |

M2 can be built and tested on the US$10 Mureka Trial. M3 at 5 days is tight once Razorpay subscriptions are added; Razorpay account approval on the client side can also delay it (risk R-6).

## 6. Third-party and running costs (paid by client)

Fixed monthly cost after launch is about ₹2,600–3,000 including Vercel Pro and one mailbox. All AI usage is paid from a prepaid Mureka balance. The client must read and accept the terms of use of every provider below. All accounts are opened in the client's name, so every bill is visible to the client directly.

| Item | Provider | Approximate cost | Notes |
| --- | --- | --- | --- |
| VPS hosting (back end) | Hostinger KVM 1 (1 vCPU, 4 GB RAM) | ₹599/month intro price | Client chooses and pays monthly or yearly billing; the intro price needs a multi-year prepaid plan, and monthly or renewal is higher (earlier quote ₹999/month) |
| Website hosting (front end) | Vercel Pro | US$20/month (about ₹1,760) | Free Hobby plan is fine during development but not allowed for commercial use |
| Database | MongoDB Atlas free tier | ₹0 up to 512 MB | Paid tier needed only as data grows |
| Audio storage | Cloudflare R2 | ₹0 up to 10 GB, then a few rupees per GB | Downloads (egress) are free on R2 |
| Domain | Client's registrar | About ₹1,200/year |  |
| Business email | Hostinger Business Email | About ₹179 per mailbox per month after promo | Client's choice; Zoho or Google Workspace also fine |
| Login and reset emails | Brevo or Resend free tier, or the Hostinger mailbox | ₹0 at beta scale | Needed for FR-1.4 and FR-1.6 |
| Google sign-in | Google Cloud OAuth | ₹0 | Needs a Google Cloud project and consent screen in the client's name |
| Mureka balance: Trial | Mureka API | US$10, once per account | 1 job at a time; 12-month validity; enough for development and M2 samples |
| Mureka balance: Basic | Mureka API | US$1,000 | 5 jobs at a time; 12-month validity; recommended before public launch |
| Feature 1: song | Mureka V9.5 (default) | US$0.15 per song (one song per request) | V9 US$0.045; V7.6 US$0.03 per song |
| Feature 1: instrumental (FR-3.9) | Mureka BGM | US$0.15 per track on V9.5 | |
| Feature 2: remix | Mureka Remix (V8) | US$0.20 per song (one version per request) | |
| Feature 3: stem download, 12 tracks | Mureka Separation V2 | US$0.70 per song | WAV and MIDI output |
| Feature 3: stem download, 5 tracks | Mureka Separation V1 | US$0.06 per song | Optional cheaper setting (FR-5.7) |
| Payments | Razorpay | About 2% per payment plus GST on the fee | Confirm on Razorpay's pricing page |

**Mureka concurrency:** each purchase sets how many Mureka jobs run at the same time, and it is counted per purchase, not added up (buying US$1,000 five times gives 5, not 25). The Trial can be bought only once; the next option is US$1,000. Stem jobs are limited to one at a time on every tier unless Mureka sales raise it. [Mureka pricing](https://platform.mureka.ai/pricing)

Mureka bills in US dollars, so rupee cost moves with the exchange rate (about ₹88 per US dollar used here). Prices were checked on 19 Oct 2026. Per-feature credit prices (FR-7.1) should be set above these costs; Feature 2 costs about 1.3 times and 12-stem Feature 3 about 5 times a Feature 1 song.

## 7. Technical risks and notes

The biggest risks now are commercial, not technical: Mureka's concurrency model (one job at a time on the Trial, a US$1,000 minimum for more) and the dependence of all three features on a single provider the client has chosen.

| ID | Risk | Impact | Recommendation |
| --- | --- | --- | --- |
| R-1 | Mureka concurrency. The US$10 Trial allows 1 job at a time for the whole site; the next tier is a US$1,000 purchase for 5. Stem jobs are always 1 at a time. | On the Trial, users queue behind each other; a busy hour means long waits. Stem waits grow with stem traffic. | Build and test on the Trial; buy Basic (US$1,000) before public launch. Queue enforces the limit (FR-8.9) and shows position (NFR-4). Ask Mureka sales about higher stem concurrency if needed. |
| R-2 | Single provider. All three features depend on Mureka, the client's chosen provider. | A Mureka outage, price change, policy change or empty balance stops all three tools at once | Adapter layer (FR-9.1) allows another provider per feature later, as a change request; low-balance warning (FR-8.10) |
| R-3 | Bhojpuri vocals. Mureka's published language lists do not include Bhojpuri. | Pronunciation and accent may be inconsistent | Test 10 sample songs in M2 before promising quality to users; Hindi option kept in the form |
| R-4 | Stem quality and cost. Separation V2 gives up to 12 stems at US$0.70 per song; dholak, harmonium and banjo have no own stem and land in drums, keyboard or other. V1 is cheap but has only 5 stems, with no guitar or piano. | Users may expect a separate dholak or harmonium stem; high cost per stem job | State on the tool page which stems are produced; price stem credits accordingly; V1 available as a cost setting (FR-5.7) |
| R-5 | Copyright in Feature 2. Remix keeps the input song's music, and users may upload famous Bhojpuri songs they do not own. | Takedown claims and legal exposure fall on the client's platform | Rights checkbox (FR-4.2), clear Terms of Service, takedown process (FR-8.8); client should check Mureka's commercial-use terms |
| R-6 | Razorpay activation needs business KYC and live legal pages; subscriptions may need separate approval | M3 payments can be blocked by delays outside the developer's control | Client applies to Razorpay in week 1; M3 can be accepted in Razorpay test mode |
| R-7 | Storage name mix-up: the brief said "cloudinary r2". Cloudinary and Cloudflare R2 are different services. | Wrong account or cost plan | Decided: Cloudflare R2. Downloads are free and storage is about US$0.015 per GB per month after 10 GB free; Cloudinary bills bandwidth and processing from credits and suits images and video, not large audio downloads |
| R-8 | Stem files are large: 12 WAV stems of a 4-minute song come to roughly 0.5 GB | The free 10 GB of R2 fills after about 20 stem jobs; beyond that R2 costs about US$0.015 per GB per month | Keep stems for 30 days, then auto-delete (FR-5.6); client pays R2 storage above the free tier |
| R-9 | Mureka output links expire (songs after 30 days, stem ZIPs sooner) | Songs disappear from the library if not copied | Copy every output to R2 as soon as the job finishes (FR-5.3, FR-6.7) |
| R-11 | No preview step. Mureka always generates full songs, so the earlier "30-second preview, then full song" flow is removed. | Each request costs a full song price | Client accepted: one full song per request, no preview (FR-3.2) |

Sources: [Mureka API pricing](https://platform.mureka.ai/pricing), [Mureka API documentation](https://platform.mureka.ai/docs/).

## 8. Questions to clear with the client before contract

Every answer below changes either scope, cost or timeline, so all should be written into the contract. Tick each one as the client confirms it.

### Credits and payments

- [ ] Subscription plans: names, monthly price and credits in each
- [ ] Credit packs: sizes and prices
- [ ] Credit cost of each feature (FR-7.1), set above the Mureka cost in section 6
- [ ] Do unused subscription credits carry over or expire at renewal? (FR-7.8)
- [ ] Free credits on signup? How many?
- [ ] Refund policy for paid credits (needed for Razorpay and the Refund Policy page)
- [ ] Is the client's business registered, and is the Razorpay account and KYC already approved? (R-6)
- [ ] Is a GST invoice needed per payment (FR-7.9)? GSTIN available?

## 9. Assumptions, exclusions and sign-off

### Assumptions

- The client opens all accounts in their own name, including the Mureka API account, and shares access within 3 working days of signing; the timeline moves by any delay.
- Mureka is the client's chosen AI provider for all three features; the client accepts Mureka's output quality, and weak Mureka output is not a developer defect.
- The client keeps the Mureka balance topped up; jobs fail with a credit refund when it is empty.
- ₹65,000 is a fixed price, exclusive of GST; change requests after sign-off are quoted at a fixed price in writing before work starts.
- Business email and hosting are bought and paid for by the client; they are not part of the ₹65,000. The client chooses the Hostinger KVM 1 billing period (monthly or yearly).
- The client supplies an official business email address for verification and reset emails, their copyright takedown process (who handles complaints and within how many days), and the minimum user age, if any.
- Payments are made per milestone after a demo on staging and written acceptance.
- The client receives full source code, the GitHub repository, all credentials and the deployment guide at M4, and can remove developer access at any time.
- 15 calendar days of bug-fix support start on M4 acceptance and cover defects in agreed requirements only.

### Not included

- Android or iOS apps
- Live status push (status updates on page refresh, FR-6.5)
- Open Studio and Audio Colour/visualizer (removed from scope)
- A multitrack editor, song editing (extend, section replace), mixing, effects or a DAW-style studio
- Stem splitting of songs users upload; stems are offered only for songs made on the site
- Mureka features other than song generation, instrumental, remix and stem (for example extend, region edit, vocal cloning, music video, lyrics generation)
- Switching any feature to another AI provider (a change request)
- Writing legal text, marketing copy, SEO or ads
- AI, hosting, email, domain, storage and payment fees (section 6)
- Maintenance after the 15-day bug-fix period; it will be discussed separately after the project is completed
- New features after sign-off; these are change requests at the agreed rate

### Sign-off checklist

- [ ] All section 8 questions answered in writing
- [ ] Milestone wording and payment plan in section 5 approved
- [ ] Third-party costs in section 6 accepted
- [ ] Copyright and legal pages owner agreed (R-5)
- [ ] Client approval: name, signature, date
- [ ] Developer approval: name, signature, date
