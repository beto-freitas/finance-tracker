import { create } from "zustand";

export type Theme = "light" | "dark";

type ThemeState = {
	theme: Theme;
};

export const useTheme = create<ThemeState>(() => ({
	theme: "dark",
}));
