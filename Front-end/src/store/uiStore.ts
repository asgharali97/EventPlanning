import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  variant: 'default' | 'destructive';
}

interface UIState {
  isBecomeHostDialogOpen: boolean;
  isBookingDialogOpen: boolean;
  eventFilter: {
    type: 'all' | 'physical' | 'online';
    search: string;
    date?: string; 
    sortByPrice: 'asc' | 'desc' | null;
    category: string
  };
  toasts: Toast[];
  isAppLoading: boolean;
  setBecomeHostDialog: (open: boolean) => void;
  setBookingDialog: (open: boolean) => void;
  setEventFilter: (filter: Partial<UIState['eventFilter']>) => void;
  addToast: (message: string, variant?: Toast['variant']) => void;
  removeToast: (id: string) => void;
  setAppLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isBecomeHostDialogOpen: false,
  isBookingDialogOpen: false,
  eventFilter: { type: 'all', search: '', date: undefined, sortByPrice: null, category: '' },
  toasts: [],
  isAppLoading: false,
  setBecomeHostDialog: (open) => set({ isBecomeHostDialogOpen: open }),
  setBookingDialog: (open) => set({ isBookingDialogOpen: open }),
  setEventFilter: (filter) =>   
    set((state) => ({ eventFilter: { ...state.eventFilter, ...filter } })),
  addToast: (message, variant = 'default') =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message, variant }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setAppLoading: (loading) => set({ isAppLoading: loading }),
}));