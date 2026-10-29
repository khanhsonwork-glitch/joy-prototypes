# Place order & Birthday without rule engine — decision ledger

Every scope decision, word for word, one per line. Check each screen against this before building it.

- 28/10 (Alex, AM Health meeting thread): "mình k đẻ ra cái rule engine là cái gì đó tách biệt riêng từ đầu. Nó chỉ là more features của cái program đó thôi"
- 28/10 (Alex): "Place order: Với khách mới: ok như b nói chỉ còn gate theo plan thôi hợp lí"
- 28/10 (Alex): "Birthday: bỏ rule engine. tôi nghĩ khách mới sẵn luôn là bản full features luôn. Còn feature nào advanced tí thì gate theo plan advanced. base vẫn là essential"
- 28/10 (Alex): "birthday nhỉ chắc ver cũ thêm banner và preview" · "còn place order thì cũng v" · "cứ ver mới nhất full features" · "có gì ae CS suggest khách cũng dễ"
- 28/10 (Nghĩa): "chỉ khác nhau nhiều ở điểm là setup đc multi program place order. thì lên adv thì mới setup được nhiều" · "dần đẩy khách cũ sang nữa, mình chạy song song 2 version cũng khó support"
- 29/10 (Alex, Telegram): "Tạo task rule engine đi rõ yêu cầu chưa?" · "/prd notion nhé đủ cả placer order và birthday nhé"

## Rules this ledger implies

| Merchant action | Earning programs list | Place order edit | Birthday edit |
|---|---|---|---|
| New shop, any plan | Latest version, no switch, no "rule engine" text; Starter: Birthday Off + Essential tag | Per the PRD table: Starter keeps what the old form gives it (dates, store credit), tax + conditions + exclusions tagged Essential; below Advanced: 2 earning methods, VIP Tier only, priority tagged Advanced | Latest multi-reward form; per-VIP-tier gifts tagged Advanced; Starter: page locked, no on/off button |
| Add a 2nd Place order below Advanced | Row tagged Advanced → upgrade modal | — | — |
| Existing shop opens edit page | Old list, no "Upgrade to Rule engine" | Old form + banner: Switch / Preview / hide 7 days or forever | Old form + banner, same flow |
| Existing shop switches | Its one Place order program moves over as one program (old multi-rule Place order: open question 5 in the PRD, not drawn) | New form, banner gone; below Advanced priority is view-only like a new shop | Latest form, rewards kept |
| Downgrade from Advanced | Banner: N programs turned off; extra Place order programs Off + Advanced tag | Off program: banner, Turn on disabled | Per-tier-only Birthday off + banner to set one reward set |
| Back to Advanced | Banner offers to show the programs turned off; they stay off | Unlocked | Unlocked |

- 29/10 (independent review, coordinator): Starter Birthday follows code (exists Off, can't be turned on); one priority rule for new and switched shops; VIP Tier only = Advanced; Starter field table; multi-rule conversion and auto-switch on re-upgrade are open questions, not drawn as decided.
