// Gestión global del estado de favoritos
import { atom } from "jotai";

// Store de favoritos: Map<productoId, boolean>
export const favoritesStateAtom = atom(new Map());

// Store de contadores: Map<productoId, number>
export const favoritesCountAtom = atom(new Map());

// Acciones para sincronizar el estado
export const updateFavoriteState = (productId, isInterested) => {
  return (get, set) => {
    const currentState = new Map(get(favoritesStateAtom));
    currentState.set(productId, isInterested);
    set(favoritesStateAtom, currentState);
  };
};

export const updateFavoriteCount = (productId, count) => {
  return (get, set) => {
    const currentCounts = new Map(get(favoritesCountAtom));
    currentCounts.set(productId, count);
    set(favoritesCountAtom, currentCounts);
  };
};

export const incrementFavoriteCount = (productId) => {
  return (get, set) => {
    const currentCounts = new Map(get(favoritesCountAtom));
    const currentCount = currentCounts.get(productId) || 0;
    currentCounts.set(productId, currentCount + 1);
    set(favoritesCountAtom, currentCounts);
  };
};

export const decrementFavoriteCount = (productId) => {
  return (get, set) => {
    const currentCounts = new Map(get(favoritesCountAtom));
    const currentCount = currentCounts.get(productId) || 0;
    currentCounts.set(productId, Math.max(0, currentCount - 1));
    set(favoritesCountAtom, currentCounts);
  };
};
