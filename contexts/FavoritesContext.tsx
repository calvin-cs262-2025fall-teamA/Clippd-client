import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from 'react';

type FavoritesContextType = {
    favorites: string[]; // Array of clippr IDs
    addFavorite: (id: string) => void;
    removeFavorite: (id: string) => void;
    isFavorited: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const stored = await SecureStore.getItemAsync('favorites');
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
        }
    };

    useEffect(() => {
        if (favorites.length >= 0) {
            SecureStore.setItemAsync('favorites', JSON.stringify(favorites));
        }
    }, [favorites]);

    const addFavorite = (id: string) => {
        setFavorites(prev => [...prev, id]);
    };

    const removeFavorite = (id: string) => {
        setFavorites(prev => prev.filter(favId => favId !== id));
    };

    const isFavorited = (id: string) => {
        return favorites.includes(id);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorited }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};