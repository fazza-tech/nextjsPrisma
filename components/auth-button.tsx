"use client";

import { Chrome, Github, Loader2, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function AuthButton() {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
            </div>
        );
    }

    const signInBtn = async (provider: "github" | "google") => {
        await signIn.social({
            provider: provider,
        });
    };

    if (session?.user) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                        <AvatarImage
                            src={session.user.image || ""}
                            alt={session.user.name || "User"}
                        />
                        <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                        {session.user.name || session.user.email}
                    </span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                        await signOut({
                            fetchOptions: {
                                onSuccess: () => {
                                    window.location.href = "/";
                                },
                            },
                        });
                    }}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <Button onClick={() => signInBtn("github")}>
                <Github className="w-4 h-4 mr-2" />
                Sign in with GitHub
            </Button>
            <Button variant="outline" onClick={() => signInBtn("google")}>
                <Chrome className="w-4 h-4 mr-2" />
                Sign in with Google
            </Button>
        </div>
    );
}