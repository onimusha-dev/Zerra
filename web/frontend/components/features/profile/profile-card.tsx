import { VerificationBadge } from '@/components/ui/verification-badge';
import { getMediaUrl } from '@/lib/utils';
import Link from 'next/link';

export default function ProfileCard({ profile, username }: { profile: any; username: string }) {
    return (
        <Link
            href={`/profile/${username}`}
            className="flex gap-3 p-5 cursor-pointer transition-colors hover:bg-secondary-ui/10"
        >
            <div className="">
                <div className="h-15 w-15 overflow-hidden rounded-full bg-accent-ui border border-border-ui">
                    {profile.avatar ? (
                        <img
                            src={getMediaUrl(profile.avatar)}
                            alt={profile?.name || 'Logo'}
                            className="h-full w-full object-cover select-none"
                            draggable={false}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold opacity-40">
                            {profile?.name?.charAt(0) || '?'}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col w-full ">
                <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col pb-2">
                        <span className="text-xl font-extrabold leading-tight capitalize hover:underline">
                            {profile.name}
                        </span>
                        {profile.isVerified && <VerificationBadge size={14} />}
                        <span className="text-secondary-foreground opacity-60 select-text">
                            @{profile.username}
                        </span>
                    </div>
                    <button className="px-5 py-2 rounded-full bg-accent-ui hover:bg-accent-ui/75 transition-all duration-300">
                        Follow
                    </button>
                </div>
                <p className="line-clamp-2">
                    {profile.bio} this is a cat i wanna have it as my pet as i like big cats. this
                    is a cat i wanna have it as my pet as i like big cats. this is a cat i wanna
                    have it as my pet as i like big cats. this is a cat i wanna have it as my pet as
                    i like big cats.
                </p>
            </div>
        </Link>
    );
}
