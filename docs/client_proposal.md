# Bhojpuri AI Music Generator — Client Proposal

Oct 19, 2026 · Vijay Gautam, Shipsar Developers

**Prepared for:** Amit Kashyap\
**Prepared by:** Vijay Gautam, Shipsar Developers

## 1. Summary

We will build a Bhojpuri AI music website where users, from one dashboard, generate songs from text, make similar songs from their own audio, and download any song as a single track or as stems. It includes user accounts, credits, online payments and an admin panel, for a fixed price of **₹65,000** (exclusive of GST), submitted by 30 November 2026, in about **6 weeks** (28 working days).

As you asked, all three music tools run on one AI provider: the **Mureka API**. You keep one AI account, one prepaid balance and one bill for all AI usage. Mureka is your choice of provider, and the developer builds with it on that basis (see "Choice of AI provider" in section 8).

You own the finished website, its name, its domain and all accounts it runs on. Hosting, email and the Mureka API are billed to you directly by each provider, so every running cost is visible to you.

This proposal replaces the earlier ₹50,000 Basic MVP quote and the earlier draft that used Google Lyria, MusicGPT and a self-hosted stem splitter.

## 2. Scope

### The three music tools

| Tool | What your users do | What they get | AI engine (chosen by you) |
| --- | --- | --- | --- |
| 1. Text to Bhojpuri music | Write a prompt and lyrics, pick genre, mood, vocals, tempo, taal and instruments | One complete song (up to 5 min 30 s) per request; no 30-second preview | Mureka lyrics to song |
| 2. Audio to similar music | Upload a song (MP3 or M4A, 10 seconds to 5 min 50 s, up to 10 MB) and write new lyrics | One new song with the same music and vibe per request | Mureka Remix |
| 3. Download as single or stems | On any song they made with Tool 1 or 2, choose Download: Single or Stems | Single: one MP3. Stems: up to 12 separate tracks (vocals, drums, bass, guitar, piano, keyboard, strings, flute, brass and woodwinds, synth, FX and other) as MP3, WAV and MIDI, kept for 30 days | Single: none. Stems: Mureka Stem separation |

Tools 1 and 2 each make one song per request. Which Mureka model each tool uses is a setting in the admin panel, so you can balance quality and cost without code changes.

Tool 2 needs a song with vocals; Mureka Remix does not accept instrumental-only audio. Stems are made the first time a user asks for them on a song, and charged once; later stem downloads of that song are free while the stems are kept. Only the stems actually present in the song are returned.

### Everything else included

- **Website:** landing page, pricing page, legal pages and contact page, in English, working on phone and desktop
- **Accounts:** sign up with email or Google, email verification, forgot password, profile
- **Dashboard and library:** credit balance, plan, all past songs, audio player, MP3 download, ZIP download for stems; all music kept for at least 30 days
- **Credits:** each tool costs credits; credits are refunded automatically if a job fails
- **Payments:** monthly subscription plans and one-time credit packs through Razorpay
- **Admin panel:** manage users, add or remove credits, see all songs and payments, set plans and prices, choose Mureka models, see your Mureka balance, remove content on complaint
- **Launch:** testing, set-up on your accounts, a deployment guide, full source code and repository handover
- **Support:** 15 days of bug fixes after final acceptance

## 3. Not included

- Android or iOS apps
- Website copy, logo and brand design (you provide these; we build the pages)
- Legal text for the Terms, Privacy and Refund pages (you provide these)
- Live progress updates (job status updates when the page is refreshed)
- Open Studio and Audio Colour/visualizer (removed from scope)
- Any music editing studio: extending or editing songs, mixing or effects
- Stem splitting of songs users upload (stems are offered only for songs made on the site)
- Other Mureka features (song extend, region edit, vocal cloning, music video, lyrics generation)
- Other languages for the website interface
- Marketing, SEO or ads
- Any running cost listed in section 5
- Maintenance after the 15-day bug-fix period (discussed separately after the project is completed)
- New features requested after sign-off (quoted separately)

## 4. Timeline and payment plan

The work runs in four milestones totalling **₹65,000** over **28 working days**. You pay each milestone only after we show it working and you approve it in writing.

| Milestone | What you will see | Working days | Target date | Payment |
| --- | --- | --- | --- | --- |
| 1. Website and accounts | Landing, pricing and legal pages; sign up and login (email and Google); dashboard with both create options and the Single/Stems download | 10 | 3 Nov 2026 | ₹23,000 |
| 2. Mureka connected | Text-to-song, similar song and stem download working through the Mureka API; 10 sample Bhojpuri songs for you to review | 7 | 12 Nov 2026 | ₹16,000 |
| 3. Full user flow and payments | Users can create, play and download songs; My Songs library; credits with automatic refunds; Razorpay plans and credit packs | 5 | 19 Nov 2026 | ₹11,000 |
| 4. Admin, testing and launch | Admin panel; full testing; launch on your accounts; source code and guide handed over; 15-day support starts | 6 | 27 Nov 2026 | ₹15,000 |
| **Total** |  | **28** | Product submitted by 30 Nov 2026 | **₹65,000** |

These dates assume work starts on 21 October 2026, so you sign and share access to the accounts in section 6 by then. Work continues while you review each milestone. A later start, or late accounts, content or approvals, moves the dates by the same number of working days.

## 5. Approximate running costs (paid by you)

Expect about **₹2,600–3,000 a month** in fixed hosting and email costs once the site is live, plus your Mureka prepaid balance, which is used up per song. These are paid directly to each provider and are not part of the ₹65,000.

### Mureka API balance (prepaid)

Mureka has no monthly fee. You buy a prepaid balance, valid for 12 months, and each song or stem job is deducted from it. The size of each purchase sets how many jobs can run **at the same time** across the whole website.

| Purchase | Jobs at the same time | Notes |
| --- | --- | --- |
| Trial: US$10 (about ₹880) | 1 | One-time only per account; good for building and testing |
| Basic: US$1,000 (about ₹88,000) | 5 | Recommended before public launch |
| Standard: US$3,000 / Business: US$5,000 | 15 / 25 | For larger traffic |

On the Trial, only one song is made at a time for the whole site, and other users wait in the queue. Concurrency counts per purchase, not in total: buying US$1,000 five times still gives 5 jobs at the same time, not 25. Stem jobs run one at a time on every tier unless Mureka sales raise the limit.

### Fixed monthly costs

| Service | What it is for | Approximate cost |
| --- | --- | --- |
| Hostinger VPS (KVM 1) | Runs the back end of the website | ₹599/month at the intro price (multi-year prepaid); renewal is higher |
| Vercel Pro | Hosts the website pages | About ₹1,760/month (US$20); free while we build, but a paid plan is required once the site earns money |
| Domain name | Your website address | About ₹1,200/year |
| Business email (Hostinger) | Your company mailbox | About ₹179 per mailbox per month after the offer period |
| Database, file storage, login emails, Google sign-in | Storing users, songs and sending emails | ₹0 on free plans at launch; small charges only as you grow |

### Cost per use (from your Mureka balance)

| Action | Mureka price | Approximate cost to you |
| --- | --- | --- |
| Tool 1: one song (model V9.5, default) | US$0.15 per song | About ₹13 |
| Tool 1 on the cheapest V7.6 model | US$0.03 per song | About ₹2.60 per song |
| Tool 1 on the cheaper V9 model | US$0.045 per song | About ₹4 per song |
| Tool 2: one remix (model V8) | US$0.20 per song | About ₹17.60 |
| Stems download: up to 12 stems (Separation V2), charged once per song | US$0.70 per song | About ₹62 |
| Stems download: 5 stems only (Separation V1, optional cheaper setting) | US$0.06 per song | About ₹5.30 |
| Razorpay payment | About 2% of each payment, plus GST on the fee | |

Rupee figures use about ₹88 per US dollar; Mureka bills in US dollars, so costs move with the exchange rate. Prices are from Mureka's pricing page on 19 Oct 2026 and can change. Set your credit prices above these costs: a 12-stem download costs about 5 times a Tool 1 song.

## 6. What you provide

Within 3 working days of signing:

- [ ] Accounts in your name, with access shared with us: Hostinger, Vercel, domain, GitHub, MongoDB Atlas, Cloudflare, Google Cloud (for Google sign-in), Mureka API platform (with the US$10 Trial bought), Razorpay and the email sending service
- [ ] Logo, brand colours and all landing page text
- [ ] Lists for the Tool 1 options: genres, moods, taals and instruments
- [ ] Plan names, monthly prices and credits per plan; credit pack sizes and prices; credit cost of each tool
- [ ] Text for the Terms of Service, Privacy Policy and Refund Policy pages
- [ ] An official business email address, used to send verification and password-reset emails
- [ ] Your copyright takedown process: who handles complaints and within how many days
- [ ] The minimum user age, if any
- [ ] Your choice of Hostinger KVM 1 billing period (monthly or yearly), bought and paid by you; the ₹599/month intro price needs a multi-year prepay, monthly costs more
- [ ] Razorpay business verification (KYC), started in week 1 so payments can go live in milestone 3

Before public launch and while the site runs (your responsibility):

- [ ] Decide whether to launch on the US$10 Trial (1 job at a time) or buy the US$1,000 Basic balance (5 jobs at a time), and buy it in your Mureka account; we recommend Basic before public launch
- [ ] Set the low-balance amount at which the admin panel warns you
- [ ] Keep the Mureka balance topped up; when it runs out, all music features stop and users get their credits back

During the project:

- [ ] Review and approve each milestone within 3 working days
- [ ] Review the 10 sample songs in milestone 2 and confirm you accept the Bhojpuri pronunciation (Bhojpuri is not on Mureka's list of supported languages)

## 7. Ownership and rights

You own the software delivered for this project, once the final payment is made. The developer keeps the right to reuse their own general code and to work with other clients.

**What you own**

1. The website as delivered, with its full source code and repository.
2. The product name, brand, logo, domain and all content you provide.
3. All user data, songs and records stored on your accounts.
4. All accounts the website runs on, which stay in your name.
5. The right to use, change, host, move or sell your website without asking the developer.

**What the developer keeps**

1. The developer may reuse the general modules, components and code they wrote, during or before this project (for example login, credits, payments, job queue and AI connections), in other projects.
2. You receive a permanent, free licence to use those reused parts as part of your website, so your ownership and use are never affected.
3. The developer may work with other music clients and build similar products, but **not under your product name, brand, logo or domain**, or anything confusingly similar.
4. The developer will not reuse your content, your users' data or your business information.

**Confidentiality**

The developer keeps your business plans, user data, passwords and API keys confidential, during and after the project. At handover you can remove the developer's access to every account.

Open-source tools used in the website stay under their own free licences.

## 8. Terms

**Third-party services.** The website depends on outside providers: Mureka, Google (sign-in), Razorpay, Vercel, Hostinger, Cloudflare and MongoDB. All music features depend on Mureka alone, so a Mureka outage, price change or empty balance stops them all until it is fixed. You must read and accept each provider's terms of use, including Mureka's rules on commercial use and AI-generated music. Their prices, limits, quality and outages are outside the developer's control.

**Choice of AI provider.** Mureka was proposed and chosen by you, not by the developer. By signing, you agree to use Mureka for all music features: Bhojpuri song generation (Tool 1), similar music from uploaded audio (Tool 2) and stem separation for downloads (Tool 3). You accept the quality Mureka gives for each of these, including Bhojpuri pronunciation, how close a remix stays to the original, and which stems are separated and how cleanly. The developer's job is to connect Mureka correctly and deliver working tools. Weak output from Mureka is not a defect in the developer's work, does not hold back milestone acceptance or payment, and is not covered by the 15-day support. Changing to another provider later is a change request, quoted separately.

**AI output.** AI music varies from one try to the next. The developer delivers working tools, but cannot guarantee the musical quality of any single song, the quality of any stem, or exact Bhojpuri pronunciation.

**Content and copyright.** Users upload songs to Tool 2. Every user must confirm they have the rights to what they upload. You, as the site owner, are responsible for your Terms of Service and for acting on copyright complaints; the admin panel lets you remove any content.

**Payments.** Each milestone is paid within 3 working days of your written approval. No advance is needed. Prices are in Indian rupees. The ₹65,000 is exclusive of GST; GST is added at the applicable rate.

**Support.** 15 days of free bug fixes start on final acceptance. They cover faults in the agreed scope, not new features or provider outages. Maintenance after that is not included; it will be discussed separately after the project is completed.

**Changes.** Work outside this scope is quoted at a fixed price, in writing, before it starts.

**Delays.** If accounts, content or approvals arrive late, the timeline moves by the same number of days, with no change in price.

**Ending early.** Either side may end the project with 7 days' written notice. You pay for approved milestones and receive all code for them.

**Validity.** This proposal is valid for 15 days from the date above.

## 9. Acceptance

By signing, both sides agree to the scope, price of ₹65,000, payment plan and terms above, and the client confirms that Mureka is their chosen AI provider for all music features. The client also confirms they have received and accept this proposal and the Requirements Specification, both shared in the same email; the specification forms part of this agreement.

|  | Client | Developer |
| --- | --- | --- |
| Name | Amit Kashyap | Vijay Gautam, Shipsar Developers |
| Signature |  |  |
| Date |  |  |
