# Comment CRUD Implementation Documentation

This document explains the architecture and data flow for the Comment CRUD (Create, Read, Update, Delete) operations in the application.

## 🏗️ Architecture Overview

The system uses a standard Next.js App Router architecture with a Prisma/PostgreSQL backend and Better Auth for session management.

### Key Files
1.  **Schema**: [schema.prisma](file:///c:/Users/ebran/nextjsPrisma/nextjsPrisma/prisma/schema.prisma) - Defines the `Comment` model.
2.  **API (Create/List)**: [route.ts](file:///c:/Users/ebran/nextjsPrisma/nextjsPrisma/app/api/comments/route.ts) - Handles `POST` (Create).
3.  **API (Update/Delete)**: [route.ts](file:///c:/Users/ebran/nextjsPrisma/nextjsPrisma/app/api/comments/[id]/route.ts) - Handles `PATCH` (Update) and `DELETE` (Delete).
4.  **UI (Form)**: [comment-form.tsx](file:///c:/Users/ebran/nextjsPrisma/nextjsPrisma/components/comment-form.tsx) - Form for creating new comments.
5.  **UI (List/Edit/Delete)**: [comment-list.tsx](file:///c:/Users/ebran/nextjsPrisma/nextjsPrisma/components/comment-list.tsx) - Displays comments and handles inline editing/deletion.

---

## �️ System Flowchart

This flowchart shows the overall logic and decision-making process for mutations (Create/Update/Delete).

```mermaid
flowchart TD
    Start([User Action]) --> Auth{Is Authenticated?}
    Auth -- No --> Deny([401 Unauthorized])
    Auth -- Yes --> ActionType{Action Type?}
    
    ActionType -- Create --> CreateLogic[Prisma.create]
    ActionType -- Update/Delete --> Ownership{Is Owner?}
    
    Ownership -- No --> Forbidden([403 Forbidden])
    Ownership -- Yes --> Mutation[Prisma.update/delete]
    
    CreateLogic --> Sync[router.refresh]
    Mutation --> Sync
    Sync --> End([UI Updated])
```

---

## �🔄 Logic Flows

### 1. Create Comment Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend as CommentForm
    participant API as /api/comments (POST)
    participant DB as Prisma/DB

    User->>Frontend: Type comment & click 'Post'
    Frontend->>API: POST { content }
    API->>API: Check Auth Session
    alt Not Authenticated
        API-->>Frontend: 401 Unauthorized
    else Authenticated
        API->>DB: prisma.comment.create()
        DB-->>API: Comment Object
        API-->>Frontend: 200 OK + Comment
        Frontend->>Frontend: Clear Textarea & router.refresh()
    end
```

### 2. Update Comment Flow
```mermaid
sequenceDiagram
    participant User
    participant List as CommentList
    participant API as /api/comments/[id] (PATCH)
    participant DB as Prisma/DB

    User->>List: Hover & Click 'Edit'
    List->>List: Show Inline Textarea
    User->>List: Modify text & click 'Save'
    List->>API: PATCH { content }
    API->>API: Check Auth & Ownership
    alt Not Owner
        API-->>List: 403 Forbidden
    else Owner
        API->>DB: prisma.comment.update()
        DB-->>API: Updated Comment
        API-->>List: 200 OK
        List->>List: Close Edit Mode & router.refresh()
    end
```

### 3. Delete Comment Flow
```mermaid
sequenceDiagram
    participant User
    participant List as CommentList
    participant API as /api/comments/[id] (DELETE)
    participant DB as Prisma/DB

    User->>List: Hover & Click 'Delete'
    List->>User: Confirm Dialog?
    User->>List: Yes
    List->>API: DELETE
    API->>API: Check Auth & Ownership
    API->>DB: prisma.comment.delete()
    DB-->>API: Success
    API-->>List: 200 OK
    List->>List: router.refresh()
```

---

## 🔒 Security & Verification
- **Authentication**: All mutation routes (`POST`, `PATCH`, `DELETE`) verify the user session using Better Auth.
- **Authorization**: For `Update` and `Delete`, the server checks if the `comment.userId` matches the `session.user.id`.
- **Validation**: Server-side checks ensure content is not empty and is a valid string.
- **Hydration**: Client-side UI uses `suppressHydrationWarning` for local-dependent dates to ensure a smooth SSR experience.
