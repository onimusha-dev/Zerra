import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserProfile } from '@/hooks/useEditProfile';

interface ProfileFormProps {
    profile: UserProfile;
    error: string | null;
    success: string | null;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function ProfileForm({ profile, error, success, onSubmit }: ProfileFormProps) {
    return (
        <form id="profile-form" onSubmit={onSubmit} className="space-y-12">
            <div className="minimal-card p-10 border-border/60">
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-border/40 pb-6">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight uppercase leading-none">
                                Persona Parameters
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">
                                Adjust your digital representation.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <Alert
                            variant="destructive"
                            className="rounded-sm border-destructive/20 bg-destructive/5"
                        >
                            <AlertDescription className="text-[10px] font-black uppercase tracking-widest">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="rounded-sm border-foreground/20 bg-muted/20 text-foreground">
                            <Check className="h-4 w-4 mr-3" />
                            <AlertDescription className="text-[10px] font-black uppercase tracking-widest">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                            >
                                Cleartext Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={profile.name}
                                required
                                className="h-12 rounded-sm bg-muted/30 border-border/40 px-4 font-bold tracking-tight focus-visible:ring-0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="username"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                            >
                                Network Handle
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                defaultValue={profile.username}
                                required
                                className="h-12 rounded-sm bg-muted/30 border-border/40 px-4 font-bold tracking-tight focus-visible:ring-0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="bio"
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                        >
                            Transmission Vector (Bio)
                        </Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            defaultValue={profile.bio}
                            className="min-h-[150px] rounded-sm bg-muted/30 border-border/40 p-6 text-base font-medium focus-visible:ring-0 resize-none leading-relaxed"
                            placeholder="Identify your essence..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label
                                htmlFor="link"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                            >
                                External Data Node
                            </Label>
                            <Input
                                id="link"
                                name="link"
                                defaultValue={profile.link}
                                placeholder="https://..."
                                className="h-12 rounded-sm bg-muted/30 border-border/40 px-4 font-bold tracking-tight focus-visible:ring-0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="avatar"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                            >
                                Visual ID (URL)
                            </Label>
                            <Input
                                id="avatar"
                                name="avatar"
                                defaultValue={profile.avatar}
                                placeholder="https://..."
                                className="h-12 rounded-sm bg-muted/30 border-border/40 px-4 font-bold tracking-tight focus-visible:ring-0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="timezone"
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1"
                        >
                            Temporal Node Alignment
                        </Label>
                        <select
                            id="timezone"
                            name="timezone"
                            defaultValue={profile.timezone || 'UTC'}
                            className="flex h-12 w-full rounded-sm bg-muted/30 border border-border/40 px-4 py-1 text-sm shadow-none focus:ring-0 focus-visible:outline-none font-bold"
                        >
                            <option value="UTC">UTC (CORE)</option>
                            <option value="America/New_York">NEW YORK (NE)</option>
                            <option value="Europe/London">LONDON (EU)</option>
                            <option value="Asia/Tokyo">TOKYO (AS)</option>
                        </select>
                    </div>
                </div>
            </div>
        </form>
    );
}
