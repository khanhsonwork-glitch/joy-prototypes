# Scope decisions (17/11/2026)

Scope as given for this prototype, one line each:

- Custom blocks (Heading, Rich text, Button, Divider, Image banner, Image with text, Custom link, Custom CTA) get a "Show to" select: Everyone (default), Guests only, Members only.
- Help text under it: "Guests are visitors who aren't loyalty members yet, including signed-in customers who haven't joined."
- The Body list row of a custom block shows both the on/off switch and the trash icon.
- Image with text gets "Link URL" (placeholder "https://example.com or /collections/sale") and "Open in new tab", same as Image banner; with a URL the block is clickable in the preview.
- A block saved as hidden for guests opens with Show to = Members only.
- Built-in sections keep "Show to guests"; its help text becomes "When off, this section is hidden from visitors who aren't loyalty members yet, including signed-in customers who haven't joined."
- Preview as: Guest / Signed in, not joined / Member. Everyone shows to all three, Guests only to the first two, Members only to Member.
- Sample content: Rich text "Start BLACK WEEK early with code BLACK26".

Choices made while drawing (to confirm):

- Show to is the first field under the panel heading (new settings go on top, like "Show to guests" on built-in sections). Link URL and "Open in new tab" sit after Layout, where Image banner has them.
- In the Body list the switch stays in the right-hand column (aligned with every other row) and the trash icon sits to its left.
- No visibility badge or subtitle on the Body row: not asked for.
