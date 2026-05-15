import { create } from 'zustand';

interface PricingStore {
  billing: 'monthly' | 'annual';
  toggle: () => void;
}

export const usePricingStore = create<PricingStore>()((set, get) => ({
  billing: 'monthly',
  toggle: () =>
    set({ billing: get().billing === 'monthly' ? 'annual' : 'monthly' }),
}));
