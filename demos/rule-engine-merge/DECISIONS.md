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
| New shop, any plan | Latest version, no switch, no "rule engine" text | New form; Starter: parts the old form lacks tagged Essential; below Advanced: 2 earning methods, VIP Tier only, priority tagged Advanced | Latest multi-reward form; per-VIP-tier gifts tagged Advanced; Starter: page locked, needs Essential |
| Add a 2nd Place order below Advanced | Row tagged Advanced → upgrade modal | — | — |
| Existing shop opens edit page | Old list, no "Upgrade to Rule engine" | Old form + banner: Switch / Preview / hide 7 days or forever | Old form + banner, same flow |
| Existing shop switches | 3 old rules become 3 programs, all keep running on any plan | New form, banner gone | Latest form, rewards kept |
| Downgrade from Advanced | Banner: N programs turned off; extra Place order programs Off + Advanced tag | Off program: banner, Turn on disabled | Per-tier-only Birthday off + banner to set one reward set |
| Back to Advanced | Banner offers to show the programs turned off; they stay off | Unlocked | Unlocked |
