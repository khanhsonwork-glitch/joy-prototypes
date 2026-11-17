# Scope decisions (17/11/2026)

Scope as given for this prototype, one line each:

- Custom blocks (Heading, Rich text, Button, Divider, Image banner, Image with text, Custom link, Custom CTA) get a select "Who can see this block": Everyone (default), Guests, Members. Same wording as the "Who can see this message" control of the Home revamp.
- Help text under it: "Guests are visitors who see the Sign in or Join screen in the widget. Everyone else counts as a member."
- The Body list row of a custom block shows both the on/off switch and the trash icon.
- Image with text gets "Link URL" (placeholder "https://example.com or /collections/sale") and "Open in new tab" (ticked by default, same as Image banner); with a URL the block is clickable in the preview.
- A block saved as hidden for guests opens with the select on Members.
- Built-in sections keep "Show to guests"; its help text becomes "When off, this section is hidden from visitors who see the Sign in or Join screen in the widget."
- Preview as, for an opt-in shop: Guest (signed out) / Signed in / Member. "Signed in" first shows the Join Program screen and counts as Guest; clicking "Join Program" moves to the Member screen. Everyone shows to all three, Guests to Guest and Signed in, Members to Member.
- Sample content: Rich text "Start BLACK WEEK early with code BLACK26".

Choices made while drawing (to confirm):

- The select is the first field under the panel heading (new settings go on top, like "Show to guests" on built-in sections). Link URL and "Open in new tab" sit after Layout, where Image banner has them.
- In the Body list the switch stays in the right-hand column (aligned with every other row) and the trash icon sits to its left.
- No visibility badge or subtitle on the Body row: not asked for.
