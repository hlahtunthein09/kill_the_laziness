/**
 * FocusFlow AI — Milestone Message Bank
 *
 * Real-world motivational speeches/quotes organized by notification stage.
 * Each entry has a real author — no AI-generated content.
 *
 * Usage: pickRandomMilestone("start") → { author, en, my }
 */

export interface MilestoneMessage {
  author: string;
  en: string;
  my: string;
}

/* ── Stage: Session Start ── */
const startMessages: MilestoneMessage[] = [
  {
    author: "Robert Mugabi",
    en: "Okay, from now on, let's focus properly.",
    my: "ကဲ အခုကစပြီး သေချာအာရုံစိုက်ရအောင်",
  },
  {
    author: "Robert Mugabi",
    en: "A good beginning makes a good ending.",
    my: "အစကောင်းမှ အနှောင်းသေချာမယ်",
  },
  {
    author: "Robert Mugabi",
    en: "Doing something is better than doing nothing at all.",
    my: "ဘာမှမလုပ်တာထက် တစ်ခုခုစလုပ်လိုက်တာကပိုကောင်းပါတယ်",
  },
];

/* ── Stage: Mid-Session Milestone ── */
const milestoneMessages: MilestoneMessage[] = [
  {
    author: "Hla Htun Thein",
    en: "Save yourself first before trying to save the world.",
    my: "ကိုယ့်လူ ကမ္ဘာကြီးကို မကယ်ခင် ကိုယ့်ကိုကိုယ်အရင် ကယ်တင်ပါ",
  },

  {
    author: "Hla Htun Thein",
    en: "Don't get distracted. Put your phone somewhere out of sight.",
    my: "အာရုံ မပျံ့စေနဲ့ ဖုန်းကို မမြင်ကွယ်ရာမှာထားထားပါ",
  },

  {
    author: "Hla Htun Thein",
    en: "If a fish can focus better than you, you need to step up.",
    my: "ငါးလောက်မှ အာရုံမစူးစိုက်နိုင်ရင် လူမလုပ်နဲ့တော့",
  },

  {
    author: "Hla Htun Thein",
    en: "Find the peace you've been missing with this app.",
    my: "ပျောက်ဆုံးနေတဲ့ ငြိမ်းချမ်းမှုကို ဒီappနဲ့ ရှာယူလိုက်ကွာ",
  },

  {
    author: "Hla Htun Thein",
    en: "Feeling the pressure? Work through it to find relief.",
    my: "pressure တွေများနေတယ်မဟုတ်လား ပြေပျောက်ဖို့အတွက် ကြိုးစားဖို့လိုတယ်",
  },

  {
    author: "Hla Htun Thein",
    en: "The mind is everything. So learn to master it.",
    my: "စိတ်ဟာအရာရာပဲ အဲ့တော့ စိတ်ကို နိုင်အောင်ထိန်း",
  },

  {
    author: "Hla Htun Thein",
    en: "Grow your focus time in this app and be proud of yourself.",
    my: "ဒီappမှာ အာရုံစိုက်ချိန်တိုးပွားအောင်လုပ်ပြီး ဂုဏ်ယူလိုက်စမ်းပါ",
  },
];

/* ── Stage: Almost Done ── */
const almostMessages: MilestoneMessage[] = [
  {
    author: "Myat Min Phyo",
    en: "You've made it this far. The only thing left is to finish.",
    my: "ဒီအထိရောက်လာပြီ ပြီးအောင်ဆက်လျှောက်ဖို့ပဲ ကျန်တော့တယ်",
  },

  {
    author: "Myat Min Phyo",
    en: "Instead of just holding on, keep conquering that restless mind.",
    my: "အားတင်းထား ဆိုတာထက် မတည်ငြိမ်တဲ့ စိတ်ကို ဆက်လက်အနိုင်ယူစမ်းပါ",
  },

  {
    author: "Myat Min Phyo",
    en: "Just a little left. Stay focused, my friend.",
    my: "ကဲ နည်းနည်းပဲ ကျန်တော့တယ် ဆက်ပြီး အာရုံစူးစိုက်ထားကွာ",
  },

  {
    author: "Myat Min Phyo",
    en: "You've managed to collect those scattered thoughts now, haven't you?",
    my: "ထွေပြားနေတဲ့ အာရုံတွေကို အခုစူးစည်းနိုင်လာပြီမဟုတ်လား",
  },
];

/* ── Stage: Session Complete ── */
const completeMessages: MilestoneMessage[] = [
  {
    author: "Zay Khant Kinn",
    en: "Congratulations! You can focus better than a fish now.",
    my: "ဂုဏ်ယူပါတယ်ကွာ မင်းငါးတွေထက် ပိုအာရုံစိုက်လာနိုင်ပြီ",
  },

  {
    author: "Zay Khant Kinn",
    en: "If you can focus like this every day, you've already won.",
    my: "ဒီလိုနေ့တိုင်း အာရုံစူးစိုက်သွားနိုင်ရင် မိမိကိုယ်ကို အောင်နိုင်ပြီပဲ",
  },

  {
    author: "Zay Khant Kinn",
    en: "Others don't need to know what you're doing. You just need to know it yourself.",
    my: "မင်းလုပ်နေတာကို သူများသိဖို့မလိုဘူး မင်းကိုယ်တိုင်သိဖို့ပဲ လိုမယ်",
  },

  {
    author: "Zay Khant Kinn",
    en: "Time's up. Take a five-minute break.",
    my: "အချိန့်ပြည့်ပြီ ငါးမိနစ်လောက် အနားယူလိုက်",
  },

  {
    author: "Zay Khant Kinn",
    en: "Not trying to give you moti, but making it to the end — be proud of that.",
    my: "moti ပေးတာတော့ မဟုတ်ပေမဲ့ ဆုံးအောင်ထိ လာနိုင်ခဲ့တာ ဂုဏ်ယူစမ်းပါ",
  },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickRandomMilestone(
  stage: "start" | "milestone" | "almost" | "complete",
): MilestoneMessage {
  switch (stage) {
    case "start":
      return pickRandom(startMessages);
    case "milestone":
      return pickRandom(milestoneMessages);
    case "almost":
      return pickRandom(almostMessages);
    case "complete":
      return pickRandom(completeMessages);
  }
}
