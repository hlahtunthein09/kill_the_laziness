/**
 * FocusFlow AI — Motivation Message Bank (Extension)
 *
 * Tiered encouraging messages in Burmese (primary) + English (secondary).
 * Picked by `getMotivation(context)` based on timer state.
 */

export type MotivationTier = 'beginning' | 'struggling' | 'succeeding' | 'completing' | 'completed';

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
  { my: 'စတင်ကြည့်ရအောင်!', en: 'Let\'s get started!' },
  { my: 'ဒီနေ့မှတ်တမ်းသစ်တစ်ခုစရအောင်', en: 'A fresh start!' },
  { my: 'စိတ်အားထက်သန်စွာစတင်ပါ', en: 'Start with energy!' },
  { my: 'သင့်ရဲ့စိတ်အားထက်သန်မှုကအစမှာပါပဲ', en: 'Your enthusiasm is at the beginning!' },
];

const strugglingMessages: MotivationMessage[] = [
  { my: 'အနည်းငယ်ပင်ပန်းနေပြီလား? အနားယူလိုက်ပါ', en: 'Feeling stuck? Take a breath.' },
  { my: 'စိတ်ဓာတ်မကျပါနဲ့! သင်နိုင်ပါတယ်', en: 'Don\'t give up! You can do it.' },
  { my: 'တစ်ဆင့်ချင်းလှမ်းကူးပါ', en: 'One step at a time.' },
  { my: 'အခက်အခဲတွေကသင်ယူခွင့်တွေပါပဲ', en: 'Challenges are learning opportunities.' },
];

const succeedingMessages: MotivationMessage[] = [
  { my: 'ကောင်းလိုက်တာ! အရမ်းစဉ်းစားနေပြီ', en: 'Great! You\'re in the zone.' },
  { my: 'စွမ်းအားအပြည့်နဲ့ရှေ့ဆက်ပါ', en: 'Keep the momentum going!' },
  { my: 'သင့်ရဲ့ရုပ်ရှင်ခံုထဲမှာစွမ်းအားပြည့်နေပြီ', en: 'Your fortress is growing!' },
  { my: 'ဒီအလုပ်ကိုအကောင်းဆုံးလုပ်နေတယ်', en: 'You\'re doing amazing work!' },
];

const completingMessages: MotivationMessage[] = [
  { my: 'အနီးကပ်လာပြီ! နောက်တစ်လှမ်းသာ', en: 'Almost there! One more step.' },
  { my: 'ပြီးဆုံးဖို့အနည်းငယ်သာလိုတော့တယ်', en: 'So close to finishing!' },
  { my: 'သင်နိုင်မယ်! အဆုံးသတ်ကို ရှေ့ဆက်ပါ', en: 'You got this! Push to the finish.' },
  { my: 'အံ့သြစရာကောင်းလိုက်တာ! သင်နီးစပ်လာပြီ', en: 'Amazing! You\'re almost done.' },
];

const completedMessages: MotivationMessage[] = [
  { my: 'ပြီးစီးပါပြီ! ကောင်းလိုက်တာ', en: 'Completed! Great job.' },
  { my: 'သင်အနိုင်ရပါပြီ', en: 'You crushed it.' },
  { my: 'ဒီအခန်းကဏ္ဍ ပြီးစီးပါပြီ', en: 'This session is done.' },
  { my: 'ရှေ့ဆက်ဖို့ အသင့်ဖြစ်ပါပြီ', en: 'Ready for the next one.' },
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

  // completed: session has finished
  if (remainingSeconds === 0) {
    return 'completed';
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
    case 'completed':
      messages = completedMessages;
      break;
  }

  const msg = pickRandom(messages);
  return { ...msg, tier };
}
