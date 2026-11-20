// Text that is the same on the English and Hindi pages.

import type { Copy } from "./en";

type Keys<T> = Record<keyof T, string>;

export const shared = {
  // Shown in Hindi on both pages, above the main heading.
  tagline: 'सूरज की ऊर्जा से रोशन करें अपना घर',
  // Each language's own name, for the language switch.
  languageNames: { en: 'English', hi: 'हिंदी' },
  // Placeholders: replace with real people and real bills before launch.
  founder: { name: 'Anshumaan Gautam' },
  // Same order as team.members in en.ts and hi.ts. `photo` names an image in src/components/sections/Team.tsx.
  team: [
    { name: 'Vinayak Kad', photo: 'vinayak-kad' },
    { name: 'Bhawna Singh', photo: 'operations-manager' },
    { name: 'Nitin Tyagi', photo: 'site-engineer' },
    { name: 'Varun Rana', photo: 'customer-success' },
  ],
  reviews: [
    { name: '[Customer name]', before: '[₹X,XXX]', after: '[₹XXX]' },
    { name: '[Customer name]', before: '[₹XX,XXX]', after: '[₹X,XXX]' },
    { name: '[Customer name]', before: '[₹X,XX,XXX]', after: '[₹XX,XXX]' },
  ],
  // What the forms' menus send in the lead email, in English whichever language the visitor
  // reads. The order here is the order of the menus; each key matches a label in en.ts and hi.ts.
  leadValues: {
    pumpSize: { hp3: '3 HP', hp5: '5 HP', hp7_5: '7.5 HP', hp10: '10 HP or more' },
    pumpRunsOn: { diesel: 'Diesel', grid: 'Grid electricity', none: 'No pump yet' },
    solarFor: { home: 'My home', society: 'Housing society', business: 'Shop, office or factory', farm: 'Farm pump' },
    monthlyBill: { under1500: 'Under ₹1,500', to3000: '₹1,500 to ₹3,000', to6000: '₹3,000 to ₹6,000', over6000: 'Over ₹6,000' },
  } satisfies {
    pumpSize: Keys<Copy['farm']['pumpOptions']>;
    pumpRunsOn: Keys<Copy['farm']['runsOptions']>;
    solarFor: Keys<Copy['contact']['forOptions']>;
    monthlyBill: Keys<Copy['contact']['billOptions']>;
  },
};

/** A menu's options in order: the key, the label in the visitor's language, and the value to send. */
export function menuOptions<K extends string>(values: Record<K, string>, labels: Record<K, string>) {
  return (Object.keys(values) as K[]).map((key) => ({ key, label: labels[key], value: values[key] }));
}
