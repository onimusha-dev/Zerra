import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export interface HealthStatus {
    status: string;
    database: 'up' | 'down';
    redis: 'up' | 'down';
    timestamp: string;
}

export function useHealthStatus() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHealth = async () => {
        setIsLoading(true);
        try {
            const response = await fetchApi('/api/health/ready');
            const result = await response.json();

            setHealth({
                status: result.status === 'up' ? 'Operational' : 'Degraded',
                database: result.data?.database?.status === 'up' ? 'up' : 'down',
                redis: result.data?.cache?.status === 'up' ? 'up' : 'down',
                timestamp: new Date().toLocaleString(),
            });
        } catch (err) {
            setHealth({
                status: 'Critical',
                database: 'down',
                redis: 'down',
                timestamp: new Date().toLocaleString(),
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 60000);
        return () => clearInterval(interval);
    }, []);

    return { health, isLoading, refresh: fetchHealth };
}
