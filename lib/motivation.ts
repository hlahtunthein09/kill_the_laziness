/**
 * FocusFlow AI — Motivation Message Bank
 *
 * Tiered encouraging messages in Burmese (primary) + English (secondary).
 * Picked by `getMotivation(context)` based on timer state.
 */

export type MotivationTier = 'beginning' | 'struggling' | 'succeeding' | 'completing';

export interface MotivationContext {
  elapsedSeconds: number;
  remainingSeconds?: number;
  isRunning: boolean;
  completedToday: number;
}

export interface MotivationMessage {
  my: string;
  en: string;
}

const beginningMessages: MotivationMessage[] = [
  { my: 'စတင်ကြည့်ရအောင်! (Let\'s get started!)', en: 'Let\'s get started!' },
  { my: 'ဒီနေ့မှတ်တမ်းသစ်တစ်ခုစရအောင် (A fresh start!)', en: 'A fresh start!' },
  { my: 'စိတ်အားထက်သန်စွာစတင်ပါ (Start with energy!)', en: 'Start with energy!' },
  { my: 'သင့်ရဲ့စိတ်အားထက်သန်မှုကအစမှာပါပဲ (Your enthusiasm is at the beginning!)', en: 'Your enthusiasm is at the beginning!' },
];

const strugglingMessages: MotivationMessage[] = [
  { my: 'အနည်းငယ်ပင်ပန်းနေပြီလား? အနားယူလိုက်ပါ (Feeling stuck? Take a breath.)', en: 'Feeling stuck? Take a breath.' },
  { my: 'စိတ်ဓာတ်မကျပါနဲ့! သင်နိုင်ပါတယ် (Don\'t give up! You can do it.)', en: 'Don\'t give up! You can do it.' },
  { my: 'တစ်ဆင့်ချင်းလှမ်းကူးပါ (One step at a time.)', en: 'One step at a time.' },
  { my: 'အခက်အခဲတွေကသင်ယူခွင့်တွေပါပဲ (Challenges are learning opportunities.)', en: 'Challenges are learning opportunities.' },
];

const succeedingMessages: MotivationMessage[] = [
  { my: 'ကောင်းလိုက်တာ! အရမ်းစဉ်းစားနေပြီ (Great! You\'re in the zone.)', en: 'Great! You\'re in the zone.' },
  { my: 'စွမ်းအားအပြည့်နဲ့ရှေ့ဆက်ပါ (Keep the momentum going!)', en: 'Keep the momentum going!' },
  { my: 'သင့်ရဲ့ရုပ်ရှင်ခံုထဲမှာစွမ်းအားပြည့်နေပြီ (Your fortress is growing!)', en: 'Your fortress is growing!' },
  { my: 'ဒီအလုပ်ကိုအကောင်းဆုံးလုပ်နေတယ် (You\'re doing amazing work!)', en: 'You\'re doing amazing work!' },
];

const completingMessages: MotivationMessage[] = [
  { my: 'အနီးကပ်လာပြီ! နောက်တစ်လှမ်းသာ (Almost there! One more step.)', en: 'Almost there! One more step.' },
  { my: 'ပြီးဆုံးဖို့အနည်းငယ်သာလိုတော့တယ် (So close to finishing!)', en: 'So close to finishing!' },
  { my: 'သင်နိုင်မယ်! အဆုံးသတ်ကို ရှေ့ဆက်ပါ (You got this! Push to the finish.)', en: 'You got this! Push to the finish.' },
  { my: 'အံ့သြစရာကောင်းလိုက်တာ! သင်နီးစပ်လာပြီ (Amazing! You\'re almost done.)', en: 'Amazing! You\'re almost done.' },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function determineTier(context: MotivationContext): MotivationTier {
  const { elapsedSeconds, remainingSeconds } = context;

  // beginning: timer just started, elapsed < 60s
  if (elapsedSeconds < 60) {
    return 'beginning';
  }

  // completing: remaining < 60s
  if (remainingSeconds !== undefined && remainingSeconds < 60) {
    return 'completing';
  }

  // struggling: elapsed > 5min and little progress (no remaining or remaining > 5min)
  if (elapsedSeconds > 300 && (remainingSeconds === undefined || remainingSeconds > 300)) {
    return 'struggling';
  }

  // succeeding: timer running and making progress
  return 'succeeding';
}

export function getMotivation(context: MotivationContext): MotivationMessage & { tier: MotivationTier } {
  const tier = determineTier(context);

  let messages: MotivationMessage[];
  switch (tier) {
    case 'beginning':
      messages = beginningMessages;
      break;
    case 'struggling':
      messages = strugglingMessages;
      break;
    case 'succeeding':
      messages = succeedingMessages;
      break;
    case 'completing':
      messages = completingMessages;
      break;
  }

  const msg = pickRandom(messages);
  return { ...msg, tier };
}
