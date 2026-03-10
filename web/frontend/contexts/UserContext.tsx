'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchApi } from '@/lib/api';

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    error: any;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchUser = async () => {
        setIsLoading(true);
        try {
            const res = await fetchApi('/api/users/me');
            if (!res.ok) throw new Error('Authentication node failed.');

            const data = await res.json();
            if (data.success) {
                setUser(data.data);
            } else {
                setUser(null);
            }
        } catch (err) {
            setError(err);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, isLoading, error, refreshUser: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
