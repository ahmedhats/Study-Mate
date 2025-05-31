import { create } from "zustand";

const getPersistedFavorites = () => {
    try {
        const data = localStorage.getItem("favoriteQuotes");
        if (data) return JSON.parse(data);
    } catch { }
    return [];
};

const persistFavorites = (favorites) => {
    try {
        localStorage.setItem("favoriteQuotes", JSON.stringify(favorites));
    } catch { }
};

const useQuoteStore = create((set, get) => ({
    currentQuote: null,
    favorites: getPersistedFavorites(),
    setCurrentQuote: (quote) => set({ currentQuote: quote }),
    toggleFavorite: (quote) =>
        set((state) => {
            const exists = state.favorites.some((q) => q._id === quote._id);
            const favorites = exists
                ? state.favorites.filter((q) => q._id !== quote._id)
                : [quote, ...state.favorites];
            persistFavorites(favorites);
            return { favorites };
        }),
    isFavorite: (quote) =>
        !!quote && get().favorites.some((q) => q._id === quote._id),
}));

export default useQuoteStore; 