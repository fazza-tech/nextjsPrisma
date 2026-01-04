import { Comment, User } from "@/lib/generated/prisma/client";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type CommentWithUser = Comment & {
    user: User;
};

export default function CommentList({ comments }: { comments: CommentWithUser[] }) {

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
                    <Card key={comment.id}>
                        <CardHeader className="p-4 pb-2">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.user?.image || undefined} alt={comment.user?.name || "User"} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {comment.user?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-semibold text-sm">{comment.user?.name}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 pt-0">
                            <p className="text-sm leading-relaxed text-left pl-10">{comment.content}</p>
                        </CardContent>
                    </Card>
                ))
            }
        </div>
    );
}