# How to file a report on EARTHLINK

A guide for Direk Adam. Four steps, about ninety seconds on a phone. Rehearse it twice
before the presentation, on mobile data rather than venue Wi-Fi.

Site: **https://earthlinkph.vercel.app/report**

---

## Before the day

- Open the site on your phone and bookmark the Report page.
- Have two or three photographs in your camera roll. Any real environmental problem you
  have seen. Not photographs of people.
- Open your inbox on the laptop that is connected to the screen, so the audience can watch
  the email arrive. Reports are emailed to the address EARTHLINK's Resend account is
  registered to. Until you have your own domain, that is Erick's inbox, and he will forward
  them to you. If you want them in your own inbox for the presentation, ask Erick to
  switch it beforehand.
- Decide the location in advance and type it. Do not rely on the venue's GPS. City and
  province are enough. The barangay is optional.
- File one practice report the day before. If the form says "Reporting is temporarily
  unavailable", tell Erick immediately. That means a setting on the server is missing, and
  nothing is lost.

## Step 1. What you saw

1. Tap the **category** that fits. There are seven: Water and ocean, Forest, Waste, Air,
   Biodiversity, Land, Environmental hazard. Say to the audience: *"The category decides
   which office the case is routed to."*
2. Type a **short title**. Eight characters or more. Example: *Smoke from open burning near
   the market.*
3. **Describe what you saw**. Thirty characters or more. What is happening, since when, who
   it affects.
4. Enter the **date** you saw it. An approximate date is fine.
5. Choose the **urgency**: Low, Moderate, High or Critical. Each one says what it means.
6. Tap **Continue**. If anything is missing, the form says exactly which field and why.

## Step 2. Where it is

1. Type the **Barangay** (optional), the **City or municipality**, and the **Province**.
   For a Metro Manila city, write *Metro Manila* as the province.
2. Optional: the **nearest landmark**, for example *behind the covered court*.
3. Say to the audience: *"The platform knows every city and municipality in the country and
   places the pin itself."*
4. Tap **Continue**.

The "Use my current location" switch also works. It asks the phone for permission and
places the pin exactly where you stand. Use it only if you are at the site, and not at the
venue, or the pin will land on the venue.

## Step 3. Evidence

1. Tap **Tap to add photographs** and choose two or three from your gallery. Up to ten.
2. Each one shows a preview and its size. Say: *"They are resized on the phone before
   sending, so it works on mobile data."*
3. Tap **Continue**. Photographs are optional, so the form will not stop you if there are
   none.

## Step 4. About you

1. Optional: your **name**, and an **email or mobile number** for updates.
2. Or tick **File this report anonymously**. Say: *"A name is optional. Anonymous reports get
   a case number too."*
3. Tick the **consent box**. This one is required.
4. Check the summary box, then tap **File this report**. It takes two to five seconds.

## What the audience sees next

- **Your EARTH case number**, for example EARTH-2026-0104. Say: *"Permanent, never reused."*
- **Open the case page**: the report is already a public page with the six-stage pipeline
  showing *Reported*.
- **See it on the map**: the new pin, with its category colour.
- On the laptop: the **email**, with every field and the photographs attached, within
  seconds.

## What happens after, and what to say

The six stages on every case page:

1. **Reported.** Someone has filed this concern. Nothing has been checked yet.
2. **Under verification.** The team checks it is real and merges duplicate reports.
3. **Referred to authorities.** The verified case and its evidence go to the office that can
   act. The public page counts how many days it has waited.
4. **Action in progress.** An inspection, an order, a mission or a clean-up is under way.
5. **Resolved.** Fixed, and the result measured and recorded.
6. **Monitoring.** Watched so it does not simply happen again.

For now, you move a case between stages yourself: open the report in the Supabase
dashboard and change its status. The public page follows on the next visit. The next build
stage puts a verification screen on the site itself.

## If something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| *Reporting is temporarily unavailable* | A server setting is missing | Tell Erick. Nothing is lost. Check the day before, not on the day. |
| *We could not find that city or municipality* | Spelling, or the wrong province | Check both fields. For NCR cities write *Metro Manila*. |
| *Several reports have been filed from your connection* | More than five in an hour from one connection | Wait, or use a different connection. This is spam protection. |
| No email arrives | The report is still saved and on the map | Check the inbox that owns the Resend account, then tell Erick. |
| The pin is in the wrong place | The pin is the centre of the city or municipality | Use "Use my current location" when you are at the real site. |

## Afterwards

Delete any practice or test report so the register stays honest: Supabase dashboard, Table
Editor, `reports`, select the row, Delete. Keep it only if a judge filed a real concern.

## Privacy, if asked

Reports are handled under the Data Privacy Act of 2012. The reporter's name and contact are
never published and never appear on the case page. They travel only in the email and stay
in the database. Anyone can report anonymously.
