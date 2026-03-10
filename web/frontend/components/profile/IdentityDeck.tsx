import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';

interface IdentityDeckProps {
    profile: UserProfile;
    transmissionCount: number;
    isMe: boolean;
}

export function IdentityDeck({ profile, transmissionCount, isMe }: IdentityDeckProps) {
    const router = useRouter();

    return (
        <div className="relative w-full ">
            {/* Fixed Size Banner */}

            <div className="w-full h-[200px] overflow-hidden relative group">
                <img
                    src={profile.banner}
                    alt="banner"
                    className="w-full h-full select-none object-cover"
                    draggable={false}
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-60" />
            </div>
            <div className="relative w-full flex justify-end pt-3  px-3">
                <Avatar className="absolute -top-25 left-5 h-40 w-40 rounded-full border-4 border-background bg-muted shadow-2xl">
                    <AvatarImage src={profile.avatar} className="object-cover" />
                    <AvatarFallback className="text-4xl font-black uppercase italic">
                        {profile.name?.[0]}
                    </AvatarFallback>
                </Avatar>
                <Button className="ml-auto">Edit Profile</Button>
            </div>
        </div>
    );
}
