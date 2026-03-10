import { useUser as useContextUser } from '@/contexts/UserContext';

export function useUser() {
    const { user, isLoading, error, refreshUser: refresh } = useContextUser();
    return { user, isLoading, error, refresh };
}
