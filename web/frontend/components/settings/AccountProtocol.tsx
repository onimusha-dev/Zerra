import React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Key, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SettingsRow } from './SettingsRow';

interface AccountProtocolProps {
    user: any;
}

export function AccountProtocol({ user }: AccountProtocolProps) {
    const router = useRouter();

    return (
        <div className="space-y-2">
            <SettingsRow
                icon={Mail}
                label="Persona Identifier"
                description={user?.email || 'No email synchronized'}
                onClick={() => router.push('/profile/edit')}
            />
            <SettingsRow
                icon={Key}
                label="Cipher Rotation"
                description="Update your authentication secret"
            />
            <div className="py-4">
                <Separator className="border-border/20" />
            </div>
            <SettingsRow
                icon={Trash2}
                label="Deconstruct Persona"
                description="Permanently erase this node"
                className="text-rose-500 border-rose-500/10 bg-rose-500/5 hover:border-rose-500/30"
            />
        </div>
    );
}
