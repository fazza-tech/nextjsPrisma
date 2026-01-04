import AuthButton from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CommentForm from "@/components/comment-form";
import CommentList from "@/components/comment-list";

export default async function Comments() {

    const comments = await prisma.comment.findMany({
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
                <CommentForm />

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4">All Comments {comments.length}</h2>
                    <CommentList comments={comments} />
                </div>
            </div>
        </main>
    );
}