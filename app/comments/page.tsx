import AuthButton from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Comments() {

    const posts = await prisma.comment.findMany({
        include: {
            user: true
        },
        orderBy: {
            createdAt: "desc"
        },

    });
    return (
        <main className="min-h-screen py-10 px-4 ">
            <div className="max-w-3xl mx-auto">
                <Button variant="ghost" asChild>
                    <Link href="/" prefetch={true} className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back To Home
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold mb-4">Comments</h1>
                <p className="text-muted-foreground mb-4">Sign in to add a comment or message</p>
                <AuthButton />
            </div>
        </main>
    );
}