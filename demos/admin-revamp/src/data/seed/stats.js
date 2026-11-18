// Read-only sample analytics for the last 30 days. Every screen that shows a KPI reads these, never its own copy.
export const last30 = {
  "revenueByJoy": 42180,
  "revenueShare": 31.4,
  "members": 5319,
  "newMembers": 412,
  "redemptionRate": 23.8,
  "aovMember": 72.4,
  "aovGuest": 54.1,
  "repeatMember": 41.2,
  "repeatGuest": 18.6,
  "pointsEarned": 612400,
  "pointsRedeemed": 288100,
  "referredRevenue": 6120,
  "retention": 38.6, "aovLift": 33.8, "returnOnReward": 4.2, "activeMembers": 3412, "participation": 64.2, "referredCustomers": 106, "referredOrders": 91, "referralVisits": 760, "walletPasses": 1820, "couponsUsed": 2380, "rewardCost": 8520, "ordersPerMember": 2.4, "ordersPerGuest": 1.2,
  "topReferrers": [{"email":"ava@example.com","referrals":5,"revenue":1224},{"email":"liam@example.com","referrals":4,"revenue":979.2},{"email":"noah@example.com","referrals":3,"revenue":734.4},{"email":"maya@example.com","referrals":2,"revenue":489.6},{"email":"emma@example.com","referrals":1,"revenue":244.8}]
};

const dailyBase = [
  {
    "date": "2026-10-20",
    "sales": 1290,
    "joy": 496
  },
  {
    "date": "2026-10-21",
    "sales": 1385,
    "joy": 364
  },
  {
    "date": "2026-10-22",
    "sales": 1480,
    "joy": 584
  },
  {
    "date": "2026-10-23",
    "sales": 1575,
    "joy": 452
  },
  {
    "date": "2026-10-24",
    "sales": 1670,
    "joy": 320
  },
  {
    "date": "2026-10-25",
    "sales": 1765,
    "joy": 540
  },
  {
    "date": "2026-10-26",
    "sales": 2460,
    "joy": 648
  },
  {
    "date": "2026-10-27",
    "sales": 1100,
    "joy": 628
  },
  {
    "date": "2026-10-28",
    "sales": 1195,
    "joy": 496
  },
  {
    "date": "2026-10-29",
    "sales": 1290,
    "joy": 364
  },
  {
    "date": "2026-10-30",
    "sales": 1385,
    "joy": 584
  },
  {
    "date": "2026-10-31",
    "sales": 1480,
    "joy": 452
  },
  {
    "date": "2026-11-01",
    "sales": 1575,
    "joy": 320
  },
  {
    "date": "2026-11-02",
    "sales": 2270,
    "joy": 780
  },
  {
    "date": "2026-11-03",
    "sales": 1765,
    "joy": 408
  },
  {
    "date": "2026-11-04",
    "sales": 1860,
    "joy": 628
  },
  {
    "date": "2026-11-05",
    "sales": 1100,
    "joy": 496
  },
  {
    "date": "2026-11-06",
    "sales": 1195,
    "joy": 364
  },
  {
    "date": "2026-11-07",
    "sales": 1290,
    "joy": 584
  },
  {
    "date": "2026-11-08",
    "sales": 1385,
    "joy": 452
  },
  {
    "date": "2026-11-09",
    "sales": 2080,
    "joy": 560
  },
  {
    "date": "2026-11-10",
    "sales": 1575,
    "joy": 540
  },
  {
    "date": "2026-11-11",
    "sales": 1670,
    "joy": 408
  },
  {
    "date": "2026-11-12",
    "sales": 1765,
    "joy": 628
  },
  {
    "date": "2026-11-13",
    "sales": 1860,
    "joy": 496
  },
  {
    "date": "2026-11-14",
    "sales": 1100,
    "joy": 364
  },
  {
    "date": "2026-11-15",
    "sales": 1195,
    "joy": 584
  },
  {
    "date": "2026-11-16",
    "sales": 1890,
    "joy": 692
  },
  {
    "date": "2026-11-17",
    "sales": 1385,
    "joy": 320
  },
  {
    "date": "2026-11-18",
    "sales": 1480,
    "joy": 540
  }
];

// Spread the sample shop's new members across the recorded days. The running allocation
// makes daily.newMembers add up to last30.newMembers exactly.
const joyTotal = dailyBase.reduce((sum, day) => sum + day.joy, 0);
let allocated = 0;
let cumulativeJoy = 0;
export const daily = dailyBase.map(day => {
  cumulativeJoy += day.joy;
  const target = Math.round(last30.newMembers * cumulativeJoy / joyTotal);
  const newMembers = target - allocated;
  allocated = target;
  return {...day, newMembers};
});

