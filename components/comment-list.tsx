"use client";

import { Comment, User } from "@/lib/generated/prisma/client";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Edit2, Trash2, X, Check, Loader2 } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";

type CommentWithUser = Comment & {
    user: User;
};

export default function CommentList({ comments }: { comments: CommentWithUser[] }) {
    const { data: session } = useSession();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();

    const handleEdit = (comment: CommentWithUser) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditContent("");
    };

    const handleUpdate = async (id: string) => {
        if (!editContent.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/comments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editContent.trim() }),
            });

            if (res.ok) {
                setEditingId(null);
                setEditContent("");
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        setIsDeleting(id);
        try {
            const res = await fetch(`/api/comments/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(null);
        }
    };

    if (comments.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {
                comments.map((comment) => (
                    <Card key={comment.id} className="relative group">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.user?.image || undefined} alt={comment.user?.name || "User"} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {comment.user?.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-semibold text-sm">{comment.user?.name}</span>
                                        <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {session?.user?.id === comment.userId && !editingId && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            onClick={() => handleEdit(comment)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(comment.id)}
                                            disabled={isDeleting === comment.id}
                                        >
                                            {isDeleting === comment.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0">
                            {editingId === comment.id ? (
                                <div className="space-y-3 pl-10">
                                    <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="min-h-[100px] text-sm"
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-2 justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancel}
                                            disabled={isSubmitting}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleUpdate(comment.id)}
                                            disabled={isSubmitting || !editContent.trim()}
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            ) : (
                                                <Check className="h-4 w-4 mr-1" />
                                            )}
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm leading-relaxed text-left pl-10 text-foreground/90">
                                    {comment.content}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))
            }
        </div>
    );
}
