// Unified widget translation sections, in the order and with the labels of Joy admin › Settings › Translations ›
// Unified widget (avada/master, read 18/11/2026). Each section lists its first rows; Points display and Activity
// messages list the rows around the two new ones (Number format, Points added via API), which TranslationEditor.jsx adds.
export const WIDGET_SECTIONS = [
  {
    "id": "header_text",
    "title": "General · Header text",
    "total": 2,
    "fields": [
      {
        "key": "header_text.0",
        "label": "Program name",
        "source": "Loyalty Program",
        "vars": false
      },
      {
        "key": "header_text.1",
        "label": "Customer Accounts mode program name",
        "source": "My Account",
        "vars": false
      }
    ]
  },
  {
    "id": "launcher",
    "title": "General · Launcher",
    "total": 2,
    "fields": [
      {
        "key": "launcher.0",
        "label": "Floating button label",
        "source": "Reward",
        "vars": false
      },
      {
        "key": "launcher.1",
        "label": "Point balance label",
        "source": "Loyalty points",
        "vars": false
      }
    ]
  },
  {
    "id": "guest_view",
    "title": "General · Guest view",
    "total": 19,
    "fields": [
      {
        "key": "guest_view.0",
        "label": "Welcome message (guest)",
        "source": "Welcome to {{program_name}}",
        "vars": true
      },
      {
        "key": "guest_view.1",
        "label": "Welcome message (guest, no program name)",
        "source": "Welcome",
        "vars": true
      },
      {
        "key": "guest_view.2",
        "label": "Guest description",
        "source": "Sign in to view your points, redeem rewards, and more.",
        "vars": false
      }
    ]
  },
  {
    "id": "opt_in_guest_view",
    "title": "General · Opt-in enrollment view",
    "total": 8,
    "fields": [
      {
        "key": "opt_in_guest_view.0",
        "label": "Opt-in enrollment description",
        "source": "Join the loyalty program to earn points, redeem rewards, and more.",
        "vars": false
      },
      {
        "key": "opt_in_guest_view.1",
        "label": "Join program button",
        "source": "Join Program",
        "vars": false
      },
      {
        "key": "opt_in_guest_view.2",
        "label": "Opt-in earn points prompt",
        "source": "Join the loyalty program to earn points",
        "vars": false
      }
    ]
  },
  {
    "id": "logged_in",
    "title": "General · Logged in",
    "total": 6,
    "fields": [
      {
        "key": "logged_in.0",
        "label": "Welcome back greeting",
        "source": "Welcome back, {{customer_name}}",
        "vars": true
      },
      {
        "key": "logged_in.1",
        "label": "View profile link",
        "source": "View Profile",
        "vars": false
      },
      {
        "key": "logged_in.2",
        "label": "Customer Accounts mode shop now button",
        "source": "Shop now",
        "vars": false
      }
    ]
  },
  {
    "id": "points",
    "title": "Points & Description · Points display",
    "total": 8,
    "fields": [
      {
        "key": "points.0",
        "label": "Point singular",
        "source": "point",
        "vars": false
      },
      {
        "key": "points.1",
        "label": "Point plural",
        "source": "points",
        "vars": false
      },
      {
        "key": "points.2",
        "label": "Earn description template",
        "source": "Earn {{earn_points}} {{points_label}} for every ${{rate_money}} spent",
        "vars": true
      },
      {
        "key": "points.3",
        "label": "Earn description template (store credit)",
        "source": "Earn {{earn_points}} store credit for every {{rate_money}} spent",
        "vars": true
      },
      {
        "key": "points.4",
        "label": "Current tier label",
        "source": "Your current tier",
        "vars": false
      },
      {
        "key": "points.5",
        "label": "Store credit label",
        "source": "Store credit",
        "vars": false
      },
      {
        "key": "points.6",
        "label": "Store credit unit - singular",
        "source": "credit",
        "vars": false
      },
      {
        "key": "points.7",
        "label": "Store credit unit - plural",
        "source": "credits",
        "vars": false
      }
    ]
  },
  {
    "id": "tier_perks",
    "title": "Points & Description · Tier perks",
    "total": 15,
    "fields": [
      {
        "key": "tier_perks.0",
        "label": "Amount discount perk",
        "source": "{{amount}} off",
        "vars": true
      },
      {
        "key": "tier_perks.1",
        "label": "Percentage discount perk",
        "source": "{{amount}}% off",
        "vars": true
      },
      {
        "key": "tier_perks.2",
        "label": "Percentage off shipping perk",
        "source": "{{amount}}% off shipping",
        "vars": true
      }
    ]
  },
  {
    "id": "tabs",
    "title": "Tabs & Sections · Program tabs",
    "total": 3,
    "fields": [
      {
        "key": "tabs.0",
        "label": "Earn tab label",
        "source": "Earn",
        "vars": false
      },
      {
        "key": "tabs.1",
        "label": "Redeem tab label",
        "source": "Redeem",
        "vars": false
      },
      {
        "key": "tabs.2",
        "label": "Ways to redeem heading",
        "source": "Ways to Redeem",
        "vars": false
      }
    ]
  },
  {
    "id": "sections",
    "title": "Tabs & Sections · Section titles",
    "total": 9,
    "fields": [
      {
        "key": "sections.0",
        "label": "Recent activity heading",
        "source": "Recent activity",
        "vars": false
      },
      {
        "key": "sections.1",
        "label": "Recent orders heading",
        "source": "Recent Orders",
        "vars": false
      },
      {
        "key": "sections.2",
        "label": "FAQ heading",
        "source": "Frequently asked questions",
        "vars": false
      }
    ]
  },
  {
    "id": "bundling",
    "title": "Tabs & Sections · Bundling",
    "total": 10,
    "fields": [
      {
        "key": "bundling.0",
        "label": "Buy more, save more heading",
        "source": "Buy more, save more",
        "vars": false
      },
      {
        "key": "bundling.1",
        "label": "Buy more, save more empty message",
        "source": "No bundle offers yet",
        "vars": false
      },
      {
        "key": "bundling.2",
        "label": "Bundle chip — Save template",
        "source": "Save {{value}} · {{type}}",
        "vars": false
      }
    ]
  },
  {
    "id": "promoted_collections",
    "title": "Tabs & Sections · Promoted collections",
    "total": 4,
    "fields": [
      {
        "key": "promoted_collections.0",
        "label": "Promoted collections heading",
        "source": "Shop our collections",
        "vars": false
      },
      {
        "key": "promoted_collections.1",
        "label": "\"See all\" link label",
        "source": "See all",
        "vars": false
      },
      {
        "key": "promoted_collections.2",
        "label": "Product count — singular",
        "source": "product",
        "vars": false
      }
    ]
  },
  {
    "id": "referral_claim_popup",
    "title": "Coupons & Referral · Referral claim popup",
    "total": 19,
    "fields": [
      {
        "key": "referral_claim_popup.0",
        "label": "Claim headline",
        "source": "{{referrer_name}} sent you {{discount_value}} off your first order",
        "vars": false
      },
      {
        "key": "referral_claim_popup.1",
        "label": "Referrer name fallback",
        "source": "A friend",
        "vars": false
      },
      {
        "key": "referral_claim_popup.2",
        "label": "Referrer reward note",
        "source": "{{referrer_name}} earns points the moment you use it.",
        "vars": false
      }
    ]
  },
  {
    "id": "coupons",
    "title": "Coupons & Referral · Coupons",
    "total": 63,
    "fields": [
      {
        "key": "coupons.0",
        "label": "Coupons available title (2 or more coupons)",
        "source": "Coupons available",
        "vars": false
      },
      {
        "key": "coupons.1",
        "label": "Coupon available title (exactly 1 coupon)",
        "source": "Coupon available",
        "vars": false
      },
      {
        "key": "coupons.2",
        "label": "My coupons title",
        "source": "My coupons",
        "vars": false
      }
    ]
  },
  {
    "id": "referral",
    "title": "Coupons & Referral · Referral",
    "total": 32,
    "fields": [
      {
        "key": "referral.0",
        "label": "Refer a friend title",
        "source": "Refer a friend",
        "vars": false
      },
      {
        "key": "referral.1",
        "label": "Referral default subtitle",
        "source": "Earn rewards for referrals",
        "vars": false
      },
      {
        "key": "referral.2",
        "label": "Referral reward subtitle",
        "source": "Give {{friend_reward}}, Get {{your_reward}}",
        "vars": true
      }
    ]
  },
  {
    "id": "subscription_labels",
    "title": "Subscription & Survey · Subscription",
    "total": 3,
    "fields": [
      {
        "key": "subscription_labels.0",
        "label": "Subscription card title",
        "source": "Manage Subscription",
        "vars": false
      },
      {
        "key": "subscription_labels.1",
        "label": "Active subscriptions card title",
        "source": "Active subscriptions",
        "vars": false
      },
      {
        "key": "subscription_labels.2",
        "label": "Subscription card description",
        "source": "View and manage your subscriptions",
        "vars": false
      }
    ]
  },
  {
    "id": "survey_labels",
    "title": "Subscription & Survey · Survey",
    "total": 2,
    "fields": [
      {
        "key": "survey_labels.0",
        "label": "Survey card title",
        "source": "Take a Survey",
        "vars": false
      },
      {
        "key": "survey_labels.1",
        "label": "Survey card description",
        "source": "Share your feedback with us",
        "vars": false
      }
    ]
  },
  {
    "id": "redeem_flow",
    "title": "Redeem Detail · Redeem flow",
    "total": 99,
    "fields": [
      {
        "key": "redeem_flow.0",
        "label": "AI assistant redeem confirmation message",
        "source": "Your AI assistant asked to redeem this reward. Points are spent only if you confirm.",
        "vars": false
      },
      {
        "key": "redeem_flow.1",
        "label": "Insufficient points message",
        "source": "You need {{points}} more points to redeem this reward",
        "vars": true
      },
      {
        "key": "redeem_flow.2",
        "label": "Amount discount description",
        "source": "Redeem {{points}} {{unit}} for {{amount}} off your next purchase",
        "vars": true
      }
    ]
  },
  {
    "id": "send_reward_to_friend",
    "title": "Redeem Detail · Send reward to friend card title",
    "total": 28,
    "fields": [
      {
        "key": "send_reward_to_friend.0",
        "label": "Send to a friend button",
        "source": "Send to a friend",
        "vars": false
      },
      {
        "key": "send_reward_to_friend.1",
        "label": "Gift card redeem-for-myself radio",
        "source": "Redeem for myself",
        "vars": false
      },
      {
        "key": "send_reward_to_friend.2",
        "label": "Gift card send-as-gift toggle",
        "source": "Send as a gift to a friend",
        "vars": false
      }
    ]
  },
  {
    "id": "earn_flow",
    "title": "Earn Detail · Earn flow",
    "total": 134,
    "fields": [
      {
        "key": "earn_flow.0",
        "label": "Ways to earn page title",
        "source": "Ways to earn",
        "vars": false
      },
      {
        "key": "earn_flow.1",
        "label": "Complete button",
        "source": "Complete",
        "vars": false
      },
      {
        "key": "earn_flow.2",
        "label": "Earned status",
        "source": "Earned",
        "vars": false
      }
    ]
  },
  {
    "id": "reward_labels",
    "title": "Earn Detail · Reward labels",
    "total": 7,
    "fields": [
      {
        "key": "reward_labels.0",
        "label": "Percentage discount reward",
        "source": "{{earning_discount}} discount code",
        "vars": true
      },
      {
        "key": "reward_labels.1",
        "label": "Amount discount reward",
        "source": "discount {{earning_discount}}",
        "vars": true
      },
      {
        "key": "reward_labels.2",
        "label": "Free gift reward",
        "source": "free gift reward",
        "vars": true
      }
    ]
  },
  {
    "id": "empty_messages",
    "title": "Empty States · Empty messages",
    "total": 11,
    "fields": [
      {
        "key": "empty_messages.0",
        "label": "No activity title",
        "source": "No activity yet",
        "vars": false
      },
      {
        "key": "empty_messages.1",
        "label": "No points activity title",
        "source": "No points activity yet",
        "vars": false
      },
      {
        "key": "empty_messages.2",
        "label": "No store credit activity title",
        "source": "No store credit activity yet",
        "vars": false
      }
    ]
  },
  {
    "id": "activity_filters",
    "title": "Empty States · Activity filters",
    "total": 6,
    "fields": [
      {
        "key": "activity_filters.0",
        "label": "Today filter",
        "source": "Today",
        "vars": false
      },
      {
        "key": "activity_filters.1",
        "label": "Yesterday filter",
        "source": "Yesterday",
        "vars": false
      },
      {
        "key": "activity_filters.2",
        "label": "30 days filter",
        "source": "30 days",
        "vars": false
      }
    ]
  },
  {
    "id": "environmental_impact",
    "title": "Empty States · Environmental impact",
    "total": 38,
    "fields": [
      {
        "key": "environmental_impact.0",
        "label": "Redeem summary",
        "source": "Redeem {{redeeming_points}} to plant {{impact_quantity}}",
        "vars": false
      },
      {
        "key": "environmental_impact.1",
        "label": "Plastic-removal redeem summary",
        "source": "Redeem {{redeeming_points}} to remove {{impact_quantity}}",
        "vars": false
      },
      {
        "key": "environmental_impact.2",
        "label": "Environmental impact description",
        "source": "Redeem {{points}} {{unit}} to fund {{impact}}",
        "vars": true
      }
    ]
  },
  {
    "id": "order_labels",
    "title": "Empty States · Order labels",
    "total": 28,
    "fields": [
      {
        "key": "order_labels.0",
        "label": "All filter",
        "source": "All",
        "vars": false
      },
      {
        "key": "order_labels.1",
        "label": "Delivered status",
        "source": "Delivered",
        "vars": false
      },
      {
        "key": "order_labels.2",
        "label": "Partial status",
        "source": "Partial",
        "vars": false
      }
    ]
  },
  {
    "id": "page_titles",
    "title": "Sub-Pages · Page titles",
    "total": 11,
    "fields": [
      {
        "key": "page_titles.0",
        "label": "My activity page title",
        "source": "My Activity",
        "vars": false
      },
      {
        "key": "page_titles.1",
        "label": "Points history page title",
        "source": "Points history",
        "vars": false
      },
      {
        "key": "page_titles.2",
        "label": "Store credit history page title",
        "source": "Store credit history",
        "vars": false
      }
    ]
  },
  {
    "id": "profile_labels",
    "title": "Profile & membership · Profile labels",
    "total": 46,
    "fields": [
      {
        "key": "profile_labels.0",
        "label": "Tier label",
        "source": "Tier",
        "vars": false
      },
      {
        "key": "profile_labels.1",
        "label": "Go to tier (accessibility label)",
        "source": "Go to tier {{name}}",
        "vars": true
      },
      {
        "key": "profile_labels.2",
        "label": "Status label",
        "source": "Status",
        "vars": false
      }
    ]
  },
  {
    "id": "profile_editing",
    "title": "Profile & membership · Profile editing",
    "total": 48,
    "fields": [
      {
        "key": "profile_editing.0",
        "label": "Edit profile button",
        "source": "Edit Profile",
        "vars": false
      },
      {
        "key": "profile_editing.1",
        "label": "Save button",
        "source": "Save",
        "vars": false
      },
      {
        "key": "profile_editing.2",
        "label": "Cancel button",
        "source": "Cancel",
        "vars": false
      }
    ]
  },
  {
    "id": "profile_addresses",
    "title": "Profile & membership · Addresses",
    "total": 21,
    "fields": [
      {
        "key": "profile_addresses.0",
        "label": "Addresses section title",
        "source": "My addresses",
        "vars": false
      },
      {
        "key": "profile_addresses.1",
        "label": "Add address button",
        "source": "Add shipping address",
        "vars": false
      },
      {
        "key": "profile_addresses.2",
        "label": "No addresses title",
        "source": "No addresses yet",
        "vars": false
      }
    ]
  },
  {
    "id": "membership_card",
    "title": "Profile & membership · Membership card",
    "total": 32,
    "fields": [
      {
        "key": "membership_card.0",
        "label": "Tier progress \"to\" connector",
        "source": "to",
        "vars": false
      },
      {
        "key": "membership_card.1",
        "label": "Next tier prefix",
        "source": "Next:",
        "vars": false
      },
      {
        "key": "membership_card.2",
        "label": "Tier achieved label (progress bar)",
        "source": "Achieved",
        "vars": false
      }
    ]
  },
  {
    "id": "privacy_preferences",
    "title": "Profile & membership · Privacy preferences",
    "total": 11,
    "fields": [
      {
        "key": "privacy_preferences.0",
        "label": "Privacy section heading",
        "source": "Privacy preferences",
        "vars": false
      },
      {
        "key": "privacy_preferences.1",
        "label": "Privacy intro text",
        "source": "Review the tracking consent you gave this store and change it anytime.",
        "vars": false
      },
      {
        "key": "privacy_preferences.2",
        "label": "Analytics category",
        "source": "Analytics",
        "vars": false
      }
    ]
  },
  {
    "id": "redeem_category_labels",
    "title": "Redeem categories · Redeem category labels",
    "total": 9,
    "fields": [
      {
        "key": "redeem_category_labels.0",
        "label": "Redeem discount category",
        "source": "Redeem Discount",
        "vars": false
      },
      {
        "key": "redeem_category_labels.1",
        "label": "Free product rewards category",
        "source": "Free Product Rewards",
        "vars": false
      },
      {
        "key": "redeem_category_labels.2",
        "label": "Free shipping category",
        "source": "Free Shipping",
        "vars": false
      }
    ]
  },
  {
    "id": "milestone_labels",
    "title": "Milestones · Milestone labels",
    "total": 8,
    "fields": [
      {
        "key": "milestone_labels.0",
        "label": "Milestones section title",
        "source": "Milestones",
        "vars": false
      },
      {
        "key": "milestone_labels.1",
        "label": "Milestones subtitle",
        "source": "Complete challenges and earn rewards",
        "vars": false
      },
      {
        "key": "milestone_labels.2",
        "label": "Reward fallback label",
        "source": "Reward",
        "vars": false
      }
    ]
  },
  {
    "id": "milestone_units",
    "title": "Milestones · Milestone units",
    "total": 19,
    "fields": [
      {
        "key": "milestone_units.0",
        "label": "Order (singular)",
        "source": "order",
        "vars": true
      },
      {
        "key": "milestone_units.1",
        "label": "Orders (plural)",
        "source": "orders",
        "vars": false
      },
      {
        "key": "milestone_units.2",
        "label": "Review (singular)",
        "source": "review",
        "vars": false
      }
    ]
  },
  {
    "id": "footer_nav",
    "title": "Navigation · Footer navigation",
    "total": 3,
    "fields": [
      {
        "key": "footer_nav.0",
        "label": "Home nav label",
        "source": "Home",
        "vars": false
      },
      {
        "key": "footer_nav.1",
        "label": "Rewards nav label",
        "source": "Rewards",
        "vars": false
      },
      {
        "key": "footer_nav.2",
        "label": "Orders nav label",
        "source": "Orders",
        "vars": false
      }
    ]
  },
  {
    "id": "misc_labels",
    "title": "Navigation · Miscellaneous",
    "total": 33,
    "fields": [
      {
        "key": "misc_labels.0",
        "label": "Program details dialog label (fallback when a program has no title)",
        "source": "Loyalty program details",
        "vars": false
      },
      {
        "key": "misc_labels.1",
        "label": "Loading state label (screen readers)",
        "source": "Loading",
        "vars": false
      },
      {
        "key": "misc_labels.2",
        "label": "See more pagination",
        "source": "See {{count}} more",
        "vars": true
      }
    ]
  },
  {
    "id": "terms_conditions",
    "title": "Navigation · Terms & Conditions",
    "total": 4,
    "fields": [
      {
        "key": "terms_conditions.0",
        "label": "Terms link label",
        "source": "Terms & Conditions",
        "vars": false
      },
      {
        "key": "terms_conditions.1",
        "label": "Privacy link label",
        "source": "Privacy Policy",
        "vars": false
      },
      {
        "key": "terms_conditions.2",
        "label": "Lead-in sentence",
        "source": "By joining, you agree to our {terms}",
        "vars": true
      }
    ]
  },
  {
    "id": "qr_code_labels",
    "title": "QR Code · QR code labels",
    "total": 7,
    "fields": [
      {
        "key": "qr_code_labels.0",
        "label": "QR code section title",
        "source": "My QR Code",
        "vars": false
      },
      {
        "key": "qr_code_labels.1",
        "label": "QR code section subtitle",
        "source": "Show your QR at the store",
        "vars": false
      },
      {
        "key": "qr_code_labels.2",
        "label": "Information card title",
        "source": "Your Information",
        "vars": false
      }
    ]
  },
  {
    "id": "qr_code_fields",
    "title": "QR Code · QR code field labels",
    "total": 5,
    "fields": [
      {
        "key": "qr_code_fields.0",
        "label": "Name field label",
        "source": "Your Name",
        "vars": false
      },
      {
        "key": "qr_code_fields.1",
        "label": "Email field label",
        "source": "Email Address",
        "vars": false
      },
      {
        "key": "qr_code_fields.2",
        "label": "Phone field label",
        "source": "Phone Number",
        "vars": false
      }
    ]
  },
  {
    "id": "wallet_pass_labels",
    "title": "Wallet pass · Wallet pass labels",
    "total": 6,
    "fields": [
      {
        "key": "wallet_pass_labels.0",
        "label": "Wallet pass section title",
        "source": "Wallet pass",
        "vars": false
      },
      {
        "key": "wallet_pass_labels.1",
        "label": "Wallet pass section subtitle",
        "source": "Save your loyalty card to your wallet",
        "vars": false
      },
      {
        "key": "wallet_pass_labels.2",
        "label": "Wallet pass description",
        "source": "Save your loyalty card to your wallet for quick access at checkout and updates to your phone",
        "vars": false
      }
    ]
  },
  {
    "id": "reviews_labels",
    "title": "Reviews tab",
    "total": 20,
    "fields": [
      {
        "key": "reviews_labels.0",
        "label": "Reviews tab title",
        "source": "Reviews",
        "vars": false
      },
      {
        "key": "reviews_labels.1",
        "label": "Write a review button",
        "source": "Write a review",
        "vars": false
      },
      {
        "key": "reviews_labels.2",
        "label": "Empty state earn-points hint",
        "source": "Write your first review and earn {{points}} points!",
        "vars": false
      }
    ]
  },
  {
    "id": "quest_card",
    "title": "Quiz · Quiz card",
    "total": 4,
    "fields": [
      {
        "key": "quest_card.0",
        "label": "Guest teaser",
        "source": "Sign in to start this quiz",
        "vars": false
      },
      {
        "key": "quest_card.1",
        "label": "Continue button",
        "source": "Continue your quiz",
        "vars": false
      },
      {
        "key": "quest_card.2",
        "label": "Progress counter",
        "source": "Step {{current}} of {{total}}",
        "vars": true
      }
    ]
  },
  {
    "id": "quest_navigation",
    "title": "Quiz · Step navigation",
    "total": 7,
    "fields": [
      {
        "key": "quest_navigation.0",
        "label": "Next step button",
        "source": "Next step",
        "vars": false
      },
      {
        "key": "quest_navigation.1",
        "label": "Previous step button",
        "source": "Previous step",
        "vars": false
      },
      {
        "key": "quest_navigation.2",
        "label": "Locked step message",
        "source": "Complete the previous steps first",
        "vars": false
      }
    ]
  },
  {
    "id": "quest_steps",
    "title": "Quiz · Step actions",
    "total": 13,
    "fields": [
      {
        "key": "quest_steps.0",
        "label": "Birthday field label",
        "source": "Your birthday",
        "vars": false
      },
      {
        "key": "quest_steps.1",
        "label": "Invalid date message",
        "source": "Enter a valid date",
        "vars": false
      },
      {
        "key": "quest_steps.2",
        "label": "Consent opt-in button",
        "source": "Yes, sign me up",
        "vars": false
      }
    ]
  },
  {
    "id": "quest_errors",
    "title": "Quiz · Quiz errors and validation",
    "total": 23,
    "fields": [
      {
        "key": "quest_errors.0",
        "label": "Add the link to your review first",
        "source": "Add the link to your review first",
        "vars": false
      },
      {
        "key": "quest_errors.1",
        "label": "Answer the form first",
        "source": "Answer the form first",
        "vars": false
      },
      {
        "key": "quest_errors.2",
        "label": "Attach a photo of your receipt first",
        "source": "Attach a photo of your receipt first",
        "vars": false
      }
    ]
  },
  {
    "id": "quest_thankyou",
    "title": "Quiz · Thank-you reward",
    "total": 11,
    "fields": [
      {
        "key": "quest_thankyou.0",
        "label": "Reward earned heading",
        "source": "You earned a reward",
        "vars": false
      },
      {
        "key": "quest_thankyou.1",
        "label": "Points limit reached message",
        "source": "Points limit reached",
        "vars": false
      },
      {
        "key": "quest_thankyou.2",
        "label": "Free product choice label",
        "source": "Choose from these products",
        "vars": false
      }
    ]
  },
  {
    "id": "quest_quiz",
    "title": "Quiz · Quiz result",
    "total": 2,
    "fields": [
      {
        "key": "quest_quiz.0",
        "label": "Quiz result heading",
        "source": "Your result",
        "vars": false
      },
      {
        "key": "quest_quiz.1",
        "label": "Quiz result placeholder",
        "source": "Answer the quiz to see your result",
        "vars": false
      }
    ]
  },
  {
    "id": "activity_history_messages",
    "title": "Activity history · Activity messages",
    "total": 73,
    "fields": [
      {
        "key": "activity_history_messages.0",
        "label": "Bonus points when a friend claims a referral",
        "source": "Received bonus {{loyalty_point}} because {{email}} claimed your referral",
        "vars": true
      },
      {
        "key": "activity_history_messages.1",
        "label": "Earned points from reward",
        "source": "Received {{loyalty_point}} from {{program_name}} reward",
        "vars": true
      },
      {
        "key": "activity_history_messages.2",
        "label": "Earned points — Place order",
        "source": "Received {{loyalty_point}} from {{program_name}} reward",
        "vars": true
      },
      {
        "key": "activity_history_messages.3",
        "label": "Earned points — Sign up",
        "source": "Received {{loyalty_point}} from {{program_name}} reward",
        "vars": true
      },
      {
        "key": "activity_history_messages.4",
        "label": "Earned points — Birthday",
        "source": "Received {{loyalty_point}} from {{program_name}} reward",
        "vars": true
      },
      {
        "key": "activity_history_messages.5",
        "label": "Earned points — Write review",
        "source": "Received {{loyalty_point}} from {{program_name}} reward",
        "vars": true
      },
      {
        "key": "activity_history_messages.6",
        "label": "Earned a coupon from reward",
        "source": "Received a coupon from {{program_name}} reward",
        "vars": true
      },
      {
        "key": "activity_history_messages.7",
        "label": "Customer redeemed a reward",
        "source": "User redeemed a reward",
        "vars": false
      },
      {
        "key": "activity_history_messages.8",
        "label": "Admin redeemed a reward",
        "source": "Admin redeemed a reward",
        "vars": false
      },
      {
        "key": "activity_history_messages.9",
        "label": "Admin adjusted points",
        "source": "Admin adjusted {{loyalty_point}}",
        "vars": true
      },
      {
        "key": "activity_history_messages.10",
        "label": "Expired points",
        "source": "Expired {{loyalty_point}}",
        "vars": true
      },
      {
        "key": "activity_history_messages.11",
        "label": "Removed points from refunded order",
        "source": "Removed {{loyalty_point}} from refunded order #{{order_number}}",
        "vars": true
      },
      {
        "key": "activity_history_messages.12",
        "label": "Removed points from canceled order",
        "source": "Removed {{loyalty_point}} from canceled order #{{order_number}}",
        "vars": true
      },
      {
        "key": "activity_history_messages.13",
        "label": "Removed points (other)",
        "source": "Removed {{loyalty_point}}",
        "vars": true
      },
      {
        "key": "activity_history_messages.14",
        "label": "Adjusted store credit",
        "source": "Adjusted store credit",
        "vars": false
      }
    ]
  }
];
