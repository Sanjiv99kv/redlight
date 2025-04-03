import { create } from "zustand";

type MenuState = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleMenu: () => void;
};

type LoaderState = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  showLoader: () => void;
  hideLoader: () => void;
};

type AppState = MenuState & LoaderState;

export const useStore = create<AppState>((set) => ({
  // Menu State
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleMenu: () => set((state) => ({ isOpen: !state.isOpen })),

  // Loader State
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  showLoader: () => set({ isLoading: true }),
  hideLoader: () => set({ isLoading: false }),
}));
