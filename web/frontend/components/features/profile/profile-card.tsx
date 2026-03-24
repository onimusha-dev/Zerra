import { VerificationBadge } from '@/components/ui/verification-badge';
import { cn, getMediaUrl } from '@/lib/utils';
import Link from 'next/link';
import { useFollow, useUnfollow } from '@/hooks/queries/useProfile';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function ProfileCard({ profile, username }: { profile: any; username: string }) {
    const { user: currentUser } = useAuthStore();
    const followMutation = useFollow();
    const unfollowMutation = useUnfollow();

    const isOwn = currentUser?.id === profile.id;

    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (profile.isFollowing) {
                await unfollowMutation.mutateAsync(profile.id);
            } else {
                await followMutation.mutateAsync(profile.id);
            }
        } catch (error) {
            window.alert(`Unable to ${profile.isFollowing ? 'Unfollow' : 'Follow.'}`);
        }
    };

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
                            <span>{profile.name}</span>
                            {profile.isVerified && <VerificationBadge size={16} className="ml-2" />}
                        </span>
                        <span className="text-secondary-foreground opacity-60 select-text">
                            @{profile.username}
                        </span>
                    </div>
                    {!isOwn && (
                        <button
                            onClick={handleFollow}
                            disabled={followMutation.isPending || unfollowMutation.isPending}
                            className={cn(
                                'px-5 py-2 rounded-full transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed',
                                profile.isFollowing
                                    ? 'border border-border-ui hover:bg-destructive/10 hover:text-destructive hover:border-destructive group min-w-28'
                                    : 'bg-accent-ui hover:bg-accent-ui/75',
                            )}
                        >
                            {followMutation.isPending || unfollowMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                                <>
                                    <span
                                        className={profile.isFollowing ? 'group-hover:hidden' : ''}
                                    >
                                        {profile.isFollowing ? 'Following' : 'Follow'}
                                    </span>
                                    {profile.isFollowing && (
                                        <span className="hidden group-hover:inline">Unfollow</span>
                                    )}
                                </>
                            )}
                        </button>
                    )}
                </div>
                <p className="line-clamp-2 text-sm text-secondary-foreground opacity-80">
                    {profile.bio}
                </p>
            </div>
        </Link>
    );
}
