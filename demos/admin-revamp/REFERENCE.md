# Màn thật mà demo này sửa

Demo này không sửa một màn: nó dựng lại cách sắp xếp admin Joy (Alex 18/11/2026, theo gợi ý Essent trong kênh team).
Mỗi màn mới thay cho các màn thật dưới đây, đọc trên code admin Joy bản 17/11/2026 và ảnh production giao diện mới 16–17/11.

Menu: Joy: Loyalty Program › Reward programs (tab Earning, Redeeming) + Membership › VIP Tiers (tab Tiers, Design) → Program (#/program) · Home → Home (#/home) · Reward programs › Referrals → Program › Referrals (#/referrals) · Customers → Customers (#/customers)
Màn thật: Reward programs `/programs?type=earning|redeem`, VIP Tiers `/membership/vip?type=tiers|design`, Membership `/membership`; ảnh production giao diện Polaris 2, 16–17/11/2026
Ảnh so sánh: ngoài repo — ảnh chụp Reward programs, VIP Tiers và Membership trong feature map của Alex (Jerry giữ)

## Field nào đi đâu

| Màn thật | Field | Trong demo |
|---|---|---|
| Reward programs › Earning › Place an order | Earn N points for every $1 | Program › Points per spend (tier đầu = rate gốc, tier trên = hệ số nhân) |
| Reward programs › Earning › Engagement rewards | Sign up, newsletter, birthday, review, social… | Program › Ways to earn |
| Reward programs › Redeeming | Discount, free shipping, free product, store credit | Program › Rewards to redeem (khoá theo tier = "From Silver") |
| VIP Tiers › Tiers › Level-up rule, Start date, mốc từng tier | | Program › cột phải: How to reach, Keeps the tier for |
| VIP Tiers › Automatically tag VIP customers | | Program › cột phải: Customer tag in Shopify |
| VIP Tiers › phần thưởng từng tier (entry reward, perks) | | Program › {Tier} perks |
| VIP Tiers › Design / Widget editor › Membership card | | Program › thẻ tier ở cột phải |
| Reward programs › Live mode | | Nút Pause program trên đầu trang |
| (chưa có) | | Rewards rate + Try a customer, All tiers side by side |
