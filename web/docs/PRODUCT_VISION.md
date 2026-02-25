# SoundTribe — Product Vision

> **Living document.** Last updated: 2025-07-25.
> This is the canonical product reference. Every feature decision, architectural choice, and UX trade-off should be tested against this document.

---

## 1. Mission Statement

SoundTribe is the platform where the **music industry** organizes itself — across every genre, every instrument, every stage size. We connect event organizers who need talent with artists who want to perform, and artists who want to collaborate with each other — removing the friction, opacity, and middlemen that dominate the live music scene today.

For **organizers**, SoundTribe is the only place they need to go to find, vet, and book artists for their events — with structured applications, direct messaging, and a searchable talent pool. For **artists**, SoundTribe is their professional home: a portfolio, a discovery channel, a direct line to the people putting on the events they want to play, and a network of fellow musicians to collaborate with.

The long-term bet: SoundTribe becomes the LinkedIn of the music event world — a social-professional network where your reputation, connections, and activity history are the currency.

---

## 2. Target Users

### Primary Persona A — The Organizer

**Who they are:**
- Club programmers and talent bookers at venues (capacity 100–5,000)
- Independent event promoters running their own parties (warehouse, rooftop, club nights, concert venues)
- Festival A&R staff managing multi-stage lineups
- Booking agencies acting on behalf of venues (secondary user, same workflows)
- Age range: 25–45. Digital-native but time-poor. Juggle multiple events simultaneously.

**Pain today (without SoundTribe):**
- Discovery is informal: Instagram DMs, word-of-mouth, emailing management agencies cold
- No standard way to post an open slot and receive structured applications
- Evaluating artists means manually crawling SoundCloud/Mixcloud/Instagram
- Negotiating fees over WhatsApp with no paper trail
- Building a returning roster of trusted artists is a spreadsheet problem

**What success looks like on SoundTribe:**
- Posts an event slot in under 5 minutes with clear requirements (genre, experience, payment, deadline)
- Receives applications from relevant artists within 24 hours
- Can vet artists via their SoundTribe profile (bio, genres, portfolio, past events)
- Accepts/rejects with one click; accepted artist is automatically added to the event lineup
- Builds a direct messaging relationship with artists they want to work with repeatedly
- Over time: has a "trusted roster" — a shortlist of artists they rebook without needing to re-post

---

### Primary Persona B — The Artist / Performer

**Who they are:**
- Emerging musicians looking for their first paid gigs (0–3 years experience) — any genre
- Established artists building a touring schedule (jazz combos, rock bands, DJs, singer-songwriters, classical ensembles)
- Live performers of all kinds: soloists, duos, full bands, electronic acts, acoustic acts
- Multi-instrumentalists applying to a variety of performance slots
- Age range: 20–40. Highly online, identity-driven, community-embedded.

**Pain today (without SoundTribe):**
- No central place to be discovered — scattered across SoundCloud, Bandcamp, Spotify for Artists, personal websites, Instagram
- Applying for gigs means cold messaging organizers who don't know them
- No visibility into which events are actively seeking talent and what they're paying
- No structured way to present: bio, genres, portfolio, social links, experience, availability, rate
- Rejection (or silence) with zero feedback loop
- Finding collaborators (other musicians, jam partners, session players) happens informally with no central directory

**What success looks like on SoundTribe:**
- A complete artist profile that serves as their professional booking page
- Ability to browse open event postings filtered by genre, location, date, pay range
- One-click application with a personal message
- Real-time notification when an organizer accepts or rejects
- Direct messaging channel with organizers who want to work with them
- Ability to browse other artists by genre, location, and instruments — connect and message to explore collaborations
- Over time: a public profile URL they can share like a portfolio site (`soundtribe.com/artists/stagename`)

---

### Secondary Persona — The Music Enthusiast / Networker

This persona emerged naturally from the onboarding flow (roles include `enthusiast`, `collaborator`, `networker`). They are:
- Passionate music fans who want to stay close to the scene
- Audio engineers, lighting designers, visual artists, and other creatives who collaborate with artists
- Music journalists, bloggers, and content creators adjacent to the scene

**Short-term scope:** Enthusiasts can browse public event pages and artist profiles. Full-featured roles (collaborator networking, crew profiles) are **post-MVP**.

---

## 3. MVP Feature Set (Current Scope)

The MVP must deliver a complete, working loop for **both primary personas**. Everything else is a distraction.

### ✅ IN — MVP Features

| Feature | Why it's in |
|---|---|
| Registration & login (email + password) | Table stakes |
| Onboarding flow (role, preferences, location, availability, profile) | Without this, the platform has no useful data to work with |
| Artist profile (stageName, bio, genres, instruments, location, socialLinks, portfolio, rate, availability) | Core artist value prop |
| Event posting (title, description, genres, requiredInstruments, location, date, duration, payment, deadline) | Core organizer value prop |
| Browse & filter events (by genre, location, date) | Artist discovery loop |
| Browse & filter artists (by genre, location, instruments) | Organizer discovery loop |
| Apply to events (message + profile) | The core transaction |
| Manage applications (organizer accepts/rejects; artist sees status) | Completion of the transaction |
| Direct messaging (ArtistProfile ↔ EventPosting entity, with Ably real-time) | Trust-building; negotiation |
| Artist-to-artist networking (browse artists, connect, message) | Collaboration discovery; community building |
| Notifications (application received, accepted, rejected, new message) | Closing the feedback loop |
| User settings (update profile, preferences, notification settings) | Basic account hygiene |
| Responsive UI on desktop and mobile | Organizers work on desktop; artists use phones |

### ❌ OUT — Post-MVP Only

- Public event pages (no login required to view)
- Ticketing / fan-facing features
- Payments / booking fees / Stripe integration
- Artist ratings and reviews
- Verification badges
- Mobile native app
- Recommendation engine
- Organizer/artist analytics dashboards
- Contracts and riders
- Multi-language support
- Calendar/availability sync (Google Calendar, iCal)

---

## 4. Post-MVP Feature Roadmap

Listed in rough priority order based on impact × effort:

### Tier 1 — High Impact, Achievable within 6 months

1. **Public artist profile pages** — Shareable URL (`/artists/[slug]`), no login required. Artists share this link as their booking page. Landing page for organic SEO.
2. **Public event pages** — Shareable event links without login. Organizers share on social media.
3. **Saved/bookmarked artists** — Organizers can save artists to a private shortlist / roster.
4. **Application messaging thread** — Inline message thread within an application, separate from general DMs. Keeps negotiation context linked to the booking.
5. **Artist availability calendar** — Artist specifies available/unavailable dates. Organizers see live availability when browsing.
6. **Mobile-responsive polish** — The current UI was designed desktop-first. A dedicated mobile UX pass.

### Tier 2 — Growth Levers (6–12 months)

7. **Artist ratings & reviews** after completed events — Builds trust signal, drives quality.
8. **Organizer reputation score** — Artists can rate their experience with organizers (were they paid on time? professional?). Reduces exploitation of emerging artists.
9. **Verified / Pro badges** — Paid verification for established artists and trusted organizers.
10. **Featured listings** — Organizers pay to boost event visibility; artists pay for search placement.
11. **Booking marketplace mode** — Artist sets availability + fee; organizer browses and "books directly" without a posting. Shifts from application-based to marketplace-based for well-established artists.

### Tier 3 — Platform Maturity (1 year+)

12. **Stripe integration** — Direct payments between organizer and artist through the platform (enables commission model).
13. **Contracts & riders** — Digital contract templates, e-signatures, rider management.
14. **Artist analytics** — Profile views, application acceptance rate, booking conversion, profile completeness score.
15. **Organizer analytics** — Event performance, lineup quality, artist repeat booking rate.
16. **Recommendation engine** — "Artists like you also applied to..." / "Events matching your profile..." personalized feed.
17. **Map view** — Geographic event discovery, useful for touring artists.
18. **React Native mobile app** — After web product-market fit is confirmed.
19. **Multi-language support** — German, Spanish, French first (major music markets).
20. **Enthusiast / Fan features** — Event RSVP, following artists, personal event feed.

---

## 5. Application Workflow (End-to-End)

This is the canonical reference for how the app works. All UX and backend decisions should match this flow.

### 5.1 Onboarding Flow (both personas)

```
1. Landing page → "Join SoundTribe" CTA
2. Register (username, email, password)
   → Email verification sent (future: currently skipped for MVP speed)
3. Onboarding stepper (7 steps, saveable at each step):
   Step 1: Role selection (artist / organizer / enthusiast / collaborator / networker)
           → Can select multiple. Role drives what they see next.
   Step 2: Preferences (genres, instruments, influences, event types, skills)
   Step 3: Location (city, region, willing to travel radius)
   Step 4: Availability (is available, available dates)
   Step 5: Profile (first name, last name, bio)
   Step 6: Notification preferences (email, push)
   Step 7: Summary → Review + confirm → Mark onboardingComplete = true
4. Redirect to dashboard
   → If artist: prompt to create ArtistProfile if none exists
   → If organizer: prompt to post their first event
```

### 5.2 Organizer Core Loop

```
CREATE EVENT
1. Organizer clicks "Post an Event"
2. Fills event posting form:
   - Title (e.g., "Jazz pianist for weekly residency — Blue Note, NYC")
   - Description (vibe, requirements, additional context)
   - Genres required (select from list)
   - Required instruments (DJ, live PA, hardware, etc.)
   - Location (city + venue name)
   - Event date + duration (hours)
   - Payment amount + type (fixed / hourly)
   - Minimum required experience (years)
   - Application deadline
3. Event posted → status: "open"
4. Notification: (none on creation — future: "Your event is live")

RECEIVE APPLICATIONS
5. Artists apply → Organizer receives in-app notification: "New application from [ArtistName] for [EventTitle]"
6. Organizer reviews application:
   - Reads artist's message
   - Clicks through to their ArtistProfile (bio, genres, portfolio, social links, experience, rate)
   - Decision: Accept or Reject

ACCEPT/REJECT
7a. Accept:
   - Application status → "accepted"
   - Artist added to event lineup
   - Artist receives notification: "Your application to [EventTitle] was accepted 🎉"
   - Messaging channel auto-opened between organizer's Event entity and artist's ArtistProfile
   → Organizer can now message: "Here's the schedule, load-in at 22:00..."

7b. Reject:
   - Application status → "rejected"
   - Artist receives notification: "Your application to [EventTitle] was not selected"
   - (Future: optional message from organizer explaining why)

EVENT FILLED
8. When enough artists are accepted, organizer can set event status → "filled"
   → Remaining open applications automatically closed (future feature)
9. Event page shows final lineup (public, post-MVP)
```

### 5.3 Artist Core Loop

```
DISCOVER EVENTS
1. Artist browses /events page
2. Filters by: genre, location, date range, payment range (future), instruments
3. Clicks an event → sees full posting detail: description, requirements, pay, deadline, organizer entity
4. Decides if it's a fit

APPLY
5. Clicks "Apply" → writes a short personal message (why they're a fit, anything extra)
6. Application submitted → status: "pending"
7. Artist sees it in "My Applications" with status badge

TRACK & RESPOND
8. Receives in-app notification when status changes (accepted / rejected)
9. On acceptance → can message organizer via the direct messaging system
   → Discuss logistics, confirm details, ask questions
10. On rejection → can apply to other events (no limit on applications)

BUILD PROFILE & REPUTATION
11. Over time: completed events appear on profile (future: as past bookings)
12. Rating received from organizer (post-MVP)
13. Profile gains a "verified" badge (post-MVP)
```

### 5.3a Artist Networking Flow

```
DISCOVER ARTISTS
1. Artist browses /artists page (same browse UI available to organizers)
2. Filters by: genre, location, instruments
3. Clicks an artist profile → sees bio, genres, instruments, portfolio, social links

CONNECT
4. Clicks "Message" → opens a direct messaging channel (ArtistProfile ↔ ArtistProfile)
5. Opens conversation: "Hey, I play guitar and love your jazz tracks — want to jam?"

COLLABORATE (post-MVP extensions)
6. Future: shared setlists, co-applications to events, band/ensemble profiles
```

> **Genre seed list note:** The 15 seeded genres (Rock, Pop, Hip Hop, Jazz, Classical, Country, R&B, Electronic, Folk, Blues, Metal, Reggae, Latin, Soul, Punk) intentionally span the full musical spectrum. Genre selection is additive — organizers and artists can select any combination.

### 5.4 Messaging Touchpoints

> **Critical design note:** Messaging in SoundTribe is **entity-to-entity**, not user-to-user. An artist sends messages *as their ArtistProfile*. An organizer sends messages *as their EventPosting*. This mirrors how bookings work in real life — you're booking "the act", not "the person". It also supports future multi-manager accounts.

| Trigger | Sender entity | Receiver entity | Purpose |
|---|---|---|---|
| After application accepted | Event (organizer) → ArtistProfile | Logistics, schedule, tech rider |
| Artist wants to ask about event before applying | ArtistProfile → Event | Questions about requirements, pay |
| Organizer wants to headhunt a specific artist | Event → ArtistProfile | Proactive outreach |
| Ongoing working relationship | Either direction | Rebooking, scheduling, general comms |

### 5.5 Notification Touchpoints

| Event | Who receives | In-app notification | Future: email |
|---|---|---|---|
| New application received | Organizer | ✅ Yes | ✅ Yes |
| Application accepted | Artist | ✅ Yes | ✅ Yes |
| Application rejected | Artist | ✅ Yes | ✅ Yes |
| New message received | Either | ✅ Yes | ✅ Yes (digest) |
| Application deadline approaching | Organizer | Future | Future |
| Event date approaching (reminder) | Both | Future | Future |

---

## 6. Monetization Strategy

### Model A — Organizer Subscription (Freemium)

**How it works:** Free tier allows 1 active event posting and 20 applications per event. Paid tier (`Pro`, ~€29/month) unlocks unlimited postings, full application history, priority support, and analytics.

| | |
|---|---|
| **When to introduce** | 6 months post-launch (after first 200 active organizers) |
| **Technical requirements** | Stripe Subscriptions, usage metering on event creation, paywall guards in middleware |
| **User friction** | Low for free users; organizers with real booking volume will happily pay |
| **Why first** | Organizers are the supply-side constraint. Monetizing them first creates incentive alignment: organizers with more at stake post better events. |

---

### Model B — Artist Freemium (Application Boost)

**How it works:** Free tier allows 5 applications/month. Paid tier (`Artist Pro`, ~€9/month) unlocks unlimited applications + profile boost (appears higher in search results) + "Featured Artist" badge.

| | |
|---|---|
| **When to introduce** | 9–12 months post-launch |
| **Technical requirements** | Application rate limiter per user, Stripe Subscriptions, search ranking weighting |
| **User friction** | Medium — artists especially emerging ones are price-sensitive. Must have clear value: 5 apps/month is real friction, the upgrade solves a real problem. |

---

### Model C — Commission on Bookings (Transaction Fee)

**How it works:** When payments flow through the platform (Stripe Connect), SoundTribe takes a 5–8% commission on each booking fee paid from organizer to artist.

| | |
|---|---|
| **When to introduce** | 12–18 months post-launch, requires Stripe integration |
| **Technical requirements** | Stripe Connect (marketplace), escrow logic, payout scheduling, dispute resolution |
| **User friction** | High initially — users will resist platform payments. Only works once trust is established and the "on-platform" experience is clearly better than off-platform. |
| **Upside** | Highest revenue ceiling. If average booking is €300 and SoundTribe takes 6%, that's €18/booking. At 1,000 bookings/month = €18,000 MRR. |

---

### Model D — Featured Listings

**How it works:** Organizers pay to boost their event (€5–15 one-time) to appear at the top of browse results for 7 days. Artists pay for profile boost (€3–10) to appear first in their genre/location filters.

| | |
|---|---|
| **When to introduce** | 6 months post-launch, once organic volume makes "being seen" competitive |
| **Technical requirements** | Stripe one-time payments, boost expiry system, search ranking boost logic |
| **User friction** | Very low — optional, one-time, low cost |

---

### Recommended Sequencing

| Phase | Model | Notes |
|---|---|---|
| **MVP launch** | 100% free | Build the network. Monetization before product-market fit kills the network effect. |
| **6 months** | Model D (Featured Listings) + early Model A (Organizer Pro) | Lowest friction monetization first. Featured listings generate revenue without a subscription paywall. |
| **9–12 months** | Model B (Artist Freemium) | By this point artists have enough value to compel upgrades. |
| **12–18 months** | Model C (Commission) | Requires Stripe Connect + trust. Only viable once the platform owns the relationship. |
| **Ongoing** | Model A (full Organizer tier pricing) | As organizer feature set matures (analytics, roster management), justify higher price points. |

---

## 7. Success Metrics (KPIs)

### Activation Metric

**Definition:** A new user is "activated" when they complete the onboarding flow AND take their first core action within 7 days.

- **Organizer activation:** Posts their first event
- **Artist activation:** Submits their first application OR completes their ArtistProfile

→ Target: **40% activation rate** within 7 days of registration

### Engagement Metric (Weekly Active Usage)

- **Organizer WAU signal:** Logged in + reviewed at least 1 application OR sent 1 message
- **Artist WAU signal:** Browsed events OR sent 1 application OR replied to a message
- **North Star proxy:** Number of **applications submitted per week** across the platform (measures supply-demand meeting)

→ Target: **30% of registered users are WAU** at 3 months post-launch

### Core Business Metric (North Star)

**"Completed Connections"** — defined as: one application that reached `accepted` status, resulting in at least one message exchange between organizer and artist.

> This metric captures actual value delivered: a booking relationship was formed. Everything else (registrations, event posts, applications) is a leading indicator.

→ Target: **200 Completed Connections in the first 3 months**

### Health Metrics

| Metric | Target | What it signals |
|---|---|---|
| Error rate (5xx) | < 0.5% of requests | Backend stability |
| Auth success rate | > 98% | Login/session reliability |
| Onboarding completion rate | > 60% | UX quality of onboarding |
| Application-to-acceptance rate | 5–20% | Quality of matching (too high = not enough artists; too low = mismatched expectations) |
| 30-day churn | < 15% for active users | Platform stickiness |
| Average messages per Completed Connection | > 3 | Depth of relationship formed |
| Support tickets per 100 users | < 2 | Product quality proxy |

---

## 8. Constraints & Principles

These principles govern every future product and engineering decision. When in doubt, come back to this list.

### P1 — Organizers Are the Paying Customer; Artists Are the Network

Without quality artists, there are no bookings. Without organizers posting events, there's nothing for artists to apply to. The platform is two-sided — but when there's a genuine trade-off, **optimize for organizer conversion first**. An organizer who posts an event and gets great applicants will return; an artist who doesn't get booked will leave quietly.

### P2 — Never Add Friction to the Application Flow

Every second of friction in the application funnel costs us marketplace liquidity. The apply flow should be achievable in under 60 seconds once a profile is complete. No mandatory fields beyond project-relevant info. No approval gate before applying. No pay wall on the core action.

### P3 — The Artist Profile Is a Professional Asset, Not a Forum Post

Artists should feel proud to share their SoundTribe profile URL externally. It should be cleaner and more compelling than a SoundCloud bio. Design every artist-facing UI component with this in mind: it's a portfolio page, not a form.

### P4 — Real Connections Over Volume

We are not building a job board. We're building a network. A platform with 500 organizers and 2,000 artists making real bookings is vastly more valuable than one with 50,000 ghost accounts. Every product decision should optimize for quality of match over raw volume of listings.

### P5 — Privacy Respects Scene Culture

The music scene values privacy. Artists don't always want their real names attached to a public record of every gig they played. The platform must support pseudonyms (stage names separate from account names), and privacy settings must be first-class, not an afterthought.

### P6 — Mobile Is a First-Class Citizen from Day One

Organizers might work on desktop but artists browse and apply on their phones — possibly in between sets. Every UI component must work flawlessly on a 375px screen. "We'll add mobile later" is not acceptable.

### P7 — Transparent Data Practices

We store music preferences, location, availability, and communication data. As a platform that targets creatives who tend to care deeply about data rights, we should be radically transparent: what we collect, how we use it, and how to delete it. This is both ethical and a trust signal that differentiates us from large platforms.

---

## Appendix: Roles Reference

The platform supports the following user roles (set during onboarding, multiple allowed):

| Role | Description | Core experience |
|---|---|---|
| `artist` | Performer — any genre, any instrument | Apply to events, manage ArtistProfile, network with other artists |
| `organizer` | Event organizer — club, festival, promoter | Post events, manage applications, build lineup |
| `enthusiast` | Music fan, scene participant | Browse events and artists (read-only, post-MVP) |
| `collaborator` | Audio engineer, visual artist, crew | Collaboration profiles (post-MVP) |
| `networker` | Industry connector, manager, PR | Networking features (post-MVP) |
| `admin` | Platform admin | Internal moderation tools |

**MVP-supported roles: `artist` and `organizer`.** The others are captured in onboarding for future use.
