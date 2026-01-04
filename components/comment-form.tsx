"use client";

import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Loader2, Send } from "lucide-react";

export default function CommentForm() {

    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ content })
            })

            if (res.ok) {
                setContent("");
                router.refresh();
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <form action="" onSubmit={handleSubmit}>
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment..."
                rows={4}
                className="mb-4"
            />
            <Button type="submit" disabled={isSubmitting || !content.trim()} className="self-end">
                {isSubmitting ? (<Loader2 className="w-4 h-4 animate-spin" />) :
                    <Send className="w-4 h-4 mr-2" />
                }
                {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
        </form>
    );
}