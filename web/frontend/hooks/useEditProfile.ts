import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export interface UserProfile {
    id: string;
    name: string;
    username: string;
    email: string;
    bio?: string;
    link?: string;
    avatar?: string;
    timezone?: string;
    twoFactorEnabled?: boolean;
}

export function useEditProfile() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const response = await fetchApi('/api/users/me');
            const result = await response.json();
            if (result.success) {
                setProfile(result.data);
            } else {
                if (response.status === 401) router.push('/auth/login');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData(event.currentTarget);
        const payload: any = {};
        const fields = ['name', 'username', 'bio', 'link', 'avatar', 'timezone'];
        fields.forEach((field) => {
            const val = formData.get(field) as string;
            if (val !== null) {
                // Allow empty strings for clearing
                payload[field] = val;
            }
        });

        try {
            const response = await fetchApi('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.success) {
                setProfile(result.data);
                setSuccess('Identity updated.');
            } else {
                setError(result.message || 'Archive failure.');
            }
        } catch (err) {
            setError('Synchronization error.');
        } finally {
            setIsSaving(false);
        }
    }

    return {
        profile,
        isLoading,
        isSaving,
        error,
        success,
        updateProfile,
        setError,
        setSuccess,
    };
}
