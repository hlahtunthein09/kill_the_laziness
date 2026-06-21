/**
 * FocusFlow AI — Notification Templates
 *
 * Default notification title/body templates.
 * Burmese-first, short enough for desktop/mobile alerts.
 */

export interface NotificationTemplate {
  title: { my: string; en: string };
  body: { my: string; en: string };
}

export const sessionCompleteNotification: NotificationTemplate = {
  title: {
    my: 'အလုပ်ပြီးစီး!',
    en: 'Session Complete!',
  },
  body: {
    my: 'သင့်စိတ်အားထန်မှုအတွက်ဂုဏ်ယူပါတယ်။',
    en: 'Great job staying focused.',
  },
};

export const distractionBlockedNotification: NotificationTemplate = {
  title: {
    my: 'စိတ်အားထက်သန်မှူးခံရ',
    en: 'Focus Protected',
  },
  body: {
    my: 'သင့်ရဲ့အချိန်တန်ဖိုးရှိတယ်။ အန္တရာယ်ရှိတဲ့ဝဘ်ဆိုက်ကိုပိတ်ထားပါတယ်။',
    en: 'Your time is valuable. We blocked a distracting site.',
  },
};

export const milestoneNotification = (minutes: number): NotificationTemplate => ({
  title: {
    my: 'မှတ်တမ်းအသစ်!',
    en: 'Milestone Reached!',
  },
  body: {
    my: `သင်ယခုအချိန် ${minutes} မိနစ်စဉ်းစားနေပြီ!`,
    en: `You\'ve been focused for ${minutes} minutes!`,
  },
});
