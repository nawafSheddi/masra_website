# How to edit the MASRA website

A plain guide for the studio. You don't need to know any code: you ask an AI
assistant (Claude Code or Codex) in normal words, and it makes the change,
checks it, and shows it to you before anything goes live.

---

## 1. One-time setup

1. Install **Claude Code** (claude.com/claude-code), or Codex, on your
   computer and sign in.
2. Accept the GitHub invitation to the website repository, then open the
   repository folder in Claude Code (or ask it to *"download the MASRA
   website repository from GitHub and open it"*).
3. Say: **"Set up this project on my computer."** It installs what's needed
   (Node.js 24 and the project's tools) and confirms everything works.

You only do this once per computer.

---

## 2. How every change works

1. **You ask:** *"Change the About text to …"*
2. **The assistant edits** the right file and runs its safety check, which
   catches mistakes like a missing photo or unreadable colors.
3. **It shows you a screenshot**, on computer and phone sizes.
4. **You approve:** *"Looks good, save it."* (Or: *"Make the title
   smaller"* to keep adjusting.)
5. **You publish:** *"Publish the changes."* About a minute later the live
   site is updated.

Nothing goes live until you say "publish". Until then, every change is
only on your computer.

**Tips**
- One change per request is easiest to check.
- Always look at the screenshot before saying yes.
- If something looks wrong, just say what's wrong in your own words.

---

## 3. What you can ask (examples)

### Text
- *"Change the About text to: A visual production studio …"*
- *"Change the description of the Services 'Food Styling' to: …"*
- *"Change the headline in the contact section to: Let's create together."*
- *"Fix the typo in the Mamola description."*

### Photos
- *"Add these 3 photos to the Mamola page."* (attach the photos)
- *"Make this photo the main image for Shaya."* (attach it)
- *"Replace the second photo on the IDMI page with this one."*
- *"Remove the last photo from the La Bonté page."*

**Photos from Google Drive:** download the **original** photo (full
quality JPG or PNG) to your computer first, then drag it into the chat, or
tell the assistant where it is (e.g. *"it's in my Downloads folder, called
DSC0123.jpg"*). iPhone HEIC photos: export them as JPG first.

The assistant makes web-sized copies automatically. Originals stay in your
Drive; they're never uploaded to the website as-is.

### Clients (project pages)
- *"Add a new client called Jan Burger in the Menu category."*
- *"Move IDMI to the Artistic category."*
- *"Put Shaya first in the Work section."*
- *"Change the year on PETI to 2024."*
- *"Remove the Riyadh project from the website."*

For a **new client**, have this ready (the assistant will ask for anything
missing):

| What | Example |
|---|---|
| Name | Jan Burger |
| Category | Artistic, Lifestyle or Menu |
| Year | 2026 |
| 2–4 short tags | Photography, Food styling |
| 1–2 sentences about the project | "Smash burgers shot like…" |
| Photos | 1 main photo + the gallery photos (count: see below) |
| The look | pick one of the page styles below (or "like the PETI page") |
| Colors | optional: the assistant can suggest colors from the photos |

**Page styles** (each client page uses one):

| Style | Looks like | Photos |
|---|---|---|
| Theatrical | main photo under a spotlight, 3 photos around it (PETI) | exactly 3 |
| Film strip | photos sliding sideways (IDMI) | 3–8 |
| Still life | main photo zooms like a painting, details rise (La Bonté) | 2–4 |
| Picnic | tilted prints drifting, great with light colors (Mamola) | 3–8 |
| Gift | calm, centered, lots of space (Riyadh) | 2–8 |
| Documentary | a flowing photo story with Arabic + English captions (Maqsoud) | 2–30 |
| Stop-motion | only for Shaya (needs a special video sequence) | 2 |

The photo counts are what fits the screen nicely. If you want more photos
than a style allows, the assistant will suggest a style that fits them.

### Services
- *"Add a service called Retouching: high-end retouching for product
  shots."*
- *"Remove Phone Photography from the services."*
- *"Change the hover photo for Videography to one of the Shaya photos."*

### Featured clients (the logo wall)
- *"Here's the logo for Jan Burger, put it on the clients wall."* (attach
  an **SVG** if you have one, otherwise a transparent PNG)
- *"Replace Bab with Qishtya on the logo wall."*

The wall always has **24** spots, so every row is full. Adding one means
replacing one.

### Contact and other details
- *"Change the WhatsApp number to 9665xxxxxxxx."*
- *"Change the email to …"* / *"Change the Instagram account to …"*
- *"Change the message people send on WhatsApp to: Hello MASRA, …"*

### Look and layout
- *"Hide the services section."* / *"Show it again."*
- *"Put the clients section before the services."*
- *"Make the Mamola page's background a bit lighter."*

---

## 4. Publishing

- Say **"Publish the changes."** The assistant runs its final check, saves
  the change, and sends it to GitHub. The live site updates by itself in
  about a minute, once the website is connected to the studio's Cloudflare
  account (one-time, see `docs/guides/deploy.md`).
- Ask *"Show me the live page"* to confirm.

---

## 5. If something goes wrong

- **The assistant says the check failed.** It found a mistake before it
  could reach the site, such as a missing photo or too many photos for a
  style. Ask *"What's wrong and how do we fix it?"*
- **You don't like a change you already published.** Say *"Undo the last
  change and publish."* Every version of the site is kept, so nothing is
  ever lost.
- **You want an older version back.** Say *"Show me what changed this
  week"* or *"Go back to how the site was on <date>."*
- **Something is confusing or stuck.** Your developer still has access to
  the repository and can help.

---

## 6. What needs a developer

Ask the assistant first; it will tell you if something is beyond a content
change. Usually these need a developer:

- a completely new page style or new kind of section;
- a full Arabic version of the site;
- new stop-motion / video sequences (special video tools are needed);
- moving images to a separate storage bucket (R2): there's a written
  guide, `docs/guides/move-images-to-r2.md`, but it involves the
  Cloudflare dashboard.

---

## 7. Where things are (only if you're curious)

| What | File |
|---|---|
| One client page each | `src/content/clients/<name>.yaml` |
| Services | `src/content/services.yaml` |
| Logo wall | `src/content/featured-clients.yaml` |
| All other site text | `src/config/strings.ts` |
| Phone, email, Instagram | `src/config/site.config.ts` |
| Rules the assistant follows | `AGENTS.md` |
