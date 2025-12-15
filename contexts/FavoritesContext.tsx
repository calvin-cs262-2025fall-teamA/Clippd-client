/**
 * @fileoverview Favorites context for managing favorite clippers
 * @description Provides favorites state and methods for adding/removing favorites
 * Persists favorites to secure storage
 * @version 1.0.0
 */

import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Favorites context type definition
 * @typedef {Object} FavoritesContextType
 * @property {string[]} favorites - Array of favorite clipper IDs
 * @property {Function} addFavorite - Add a clipper to favorites
 * @property {Function} removeFavorite - Remove a clipper from favorites
 * @property {Function} isFavorited - Check if clipper is favorited
 */
type FavoritesContextType = {
    favorites: string[];
    addFavorite: (id: string) => void;
    removeFavorite: (id: string) => void;
    isFavorited: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

/**
 * Favorites provider component
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider wrapping children with favorites context
 */
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

/**
 * Custom hook to use Favorites context
 * @function useFavorites
 * @returns {FavoritesContextType} Favorites context with favorites list and methods
 * @throws {Error} Throws error if used outside of FavoritesProvider
 */
export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};