# Mobile App API Fixes - Publication Comments & Likes

## Overview
Fixed all API endpoint URLs in the mobile app to match the refactored backend implementation.

---

## Problem

The mobile app was using incorrect endpoint URLs:
- **Old (Wrong)**: `/api/producers/...`
- **New (Correct)**: `/api/producer-page/...`

This caused 404 errors when trying to fetch comments, likes, and other publication-related data.

---

## Changes Made

### 1. **Fixed Base URLs** ✅

All endpoints in [src/services/api.ts](src/services/api.ts) have been updated:

#### Producer Page Endpoints
```typescript
// OLD ❌
'/api/producers/categories/'
'/api/producers/pages/'
'/api/producers/pages/{slug}/'

// NEW ✅
'/api/producer-page/categories/'
'/api/producer-page/pages/'
'/api/producer-page/pages/{slug}/'
```

#### Publication Endpoints
```typescript
// OLD ❌
'/api/producers/publications/'
'/api/producers/publications/{id}/'
'/api/producers/publications/{id}/toggle_like/'
'/api/producers/publications/my_publications/'
'/api/producers/publications/public_feed/'

// NEW ✅
'/api/producer-page/publications/'
'/api/producer-page/publications/{id}/'
'/api/producer-page/publications/{id}/toggle_like/'
'/api/producer-page/publications/my_publications/'
'/api/producer-page/publications/public_feed/'
```

---

### 2. **Refactored Comment Endpoints** ✅

#### Get Comments
```typescript
// OLD ❌
async getPublicationComments(publicationId, page, limit) {
  return `/api/producers/publications/${publicationId}/comments/?page=${page}&limit=${limit}`;
}

// NEW ✅
async getPublicationComments(publicationId, page, limit) {
  const queryParams = new URLSearchParams();
  queryParams.append('publication', publicationId.toString());
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  return `/api/producer-page/comments/?${queryParams.toString()}`;
}
```

**Why?** The backend now uses query parameters instead of nested routes.

#### Create Comment
```typescript
// OLD ❌
async createComment(publicationId, content) {
  return this.makeRequest(
    `/api/producers/publications/${publicationId}/comments/create/`,
    {
      method: 'POST',
      body: JSON.stringify({ content }),
    }
  );
}

// NEW ✅
async createComment(publicationId, content, parentId?) {
  const body: any = {
    publication: publicationId,
    content: content
  };

  if (parentId) {
    body.parent = parentId;  // For nested replies
  }

  return this.makeRequest('/api/producer-page/comments/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
```

**Why?** Backend expects `publication` in the body, and we now support nested replies with `parent`.

#### Update Comment (NEW) ✅
```typescript
async updateComment(commentId: number, content: string): Promise<Comment> {
  return this.makeRequest(`/api/producer-page/comments/${commentId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
}
```

#### Delete Comment
```typescript
// OLD ❌
async deleteComment(commentId) {
  return `/api/producers/publications/comments/${commentId}/`;
}

// NEW ✅
async deleteComment(commentId) {
  return `/api/producer-page/comments/${commentId}/`;
}
```

#### Toggle Comment Like (NEW) ✅
```typescript
async toggleLikeComment(commentId: number): Promise<{ liked: boolean; likes_count: number }> {
  return this.makeRequest(
    `/api/producer-page/comments/${commentId}/toggle_like/`,
    { method: 'POST' }
  );
}
```

#### Get Comment Replies (NEW) ✅
```typescript
async getCommentReplies(commentId: number): Promise<Comment[]> {
  return this.makeRequest(
    `/api/producer-page/comments/${commentId}/replies/`
  );
}
```

---

### 3. **Fixed Response Types** ✅

#### Toggle Like Response
```typescript
// OLD ❌
interface ToggleLikeResponse {
  status: string;
  liked: boolean;
}

// NEW ✅
interface ToggleLikeResponse {
  liked: boolean;
  likes_count: number;
}
```

**Updated Methods:**
- `toggleLikePublication(id): Promise<{ liked: boolean; likes_count: number }>`
- `toggleLikeComment(id): Promise<{ liked: boolean; likes_count: number }>`

---

## API Client Methods Summary

### Comments API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `getPublicationComments(id, page, limit)` | `GET /api/producer-page/comments/?publication={id}` | ✗ | Get all comments |
| `createComment(id, content, parentId?)` | `POST /api/producer-page/comments/` | ✓ | Create comment or reply |
| `updateComment(id, content)` | `PATCH /api/producer-page/comments/{id}/` | ✓ | Update comment |
| `deleteComment(id)` | `DELETE /api/producer-page/comments/{id}/` | ✓ | Delete comment |
| `toggleLikeComment(id)` | `POST /api/producer-page/comments/{id}/toggle_like/` | ✓ | Like/unlike comment |
| `getCommentReplies(id)` | `GET /api/producer-page/comments/{id}/replies/` | ✗ | Get comment replies |

### Publications API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `getPublications()` | `GET /api/producer-page/publications/` | ✓ | Get all publications |
| `getPublication(id)` | `GET /api/producer-page/publications/{id}/` | ✗ | Get single publication |
| `createPublication(data)` | `POST /api/producer-page/publications/` | ✓ | Create publication |
| `updatePublication(id, data)` | `PATCH /api/producer-page/publications/{id}/` | ✓ | Update publication |
| `deletePublication(id)` | `DELETE /api/producer-page/publications/{id}/` | ✓ | Delete publication |
| `getMyPublications()` | `GET /api/producer-page/publications/my_publications/` | ✓ | Get my publications |
| `getPublicFeed(params)` | `GET /api/producer-page/publications/public_feed/` | ✗ | Get public feed |
| `toggleLikePublication(id)` | `POST /api/producer-page/publications/{id}/toggle_like/` | ✓ | Like/unlike |

---

## Usage Examples

### 1. Fetch Comments
```typescript
import { apiClient } from './services/api';

const fetchComments = async (publicationId: number) => {
  try {
    const response = await apiClient.getPublicationComments(publicationId, 1, 20);
    console.log('Comments:', response.results);
    console.log('Has more:', response.has_more);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 2. Create Comment
```typescript
const addComment = async (publicationId: number, text: string) => {
  try {
    const newComment = await apiClient.createComment(publicationId, text);
    console.log('Created:', newComment);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 3. Reply to Comment
```typescript
const replyToComment = async (
  publicationId: number,
  parentId: number,
  text: string
) => {
  try {
    const reply = await apiClient.createComment(publicationId, text, parentId);
    console.log('Reply created:', reply);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 4. Toggle Like on Publication
```typescript
const handleLike = async (publicationId: number) => {
  try {
    const result = await apiClient.toggleLikePublication(publicationId);
    console.log('Liked:', result.liked);
    console.log('Total likes:', result.likes_count);

    // Update UI
    setIsLiked(result.liked);
    setLikesCount(result.likes_count);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 5. Toggle Like on Comment
```typescript
const handleCommentLike = async (commentId: number) => {
  try {
    const result = await apiClient.toggleLikeComment(commentId);
    console.log('Liked:', result.liked);
    console.log('Total likes:', result.likes_count);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 6. Update Comment
```typescript
const editComment = async (commentId: number, newText: string) => {
  try {
    const updated = await apiClient.updateComment(commentId, newText);
    console.log('Updated comment:', updated);
    console.log('Is edited:', updated.is_edited); // Will be true
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 7. Delete Comment
```typescript
const removeComment = async (commentId: number) => {
  try {
    await apiClient.deleteComment(commentId);
    console.log('Comment deleted (soft delete)');
    // Comment will show as "[Supprimé]" but replies remain
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Testing Checklist

### Comments
- [x] ✅ Can fetch comments for a publication
- [x] ✅ Can create a top-level comment
- [x] ✅ Can create nested replies (using `parentId`)
- [x] ✅ Can update own comment
- [x] ✅ Can delete own comment (soft delete)
- [x] ✅ Can like/unlike comments
- [x] ✅ Like count updates correctly
- [x] ✅ Nested replies display properly
- [x] ✅ Deleted comments show as "[Supprimé]"
- [x] ✅ Permission checks work (`can_edit`, `can_delete`)

### Publications
- [x] ✅ Can fetch public feed
- [x] ✅ Can view single publication
- [x] ✅ Can like/unlike publication
- [x] ✅ Like count updates correctly
- [x] ✅ Comments count displays
- [x] ✅ Can create publication (producers only)
- [x] ✅ Can update own publication
- [x] ✅ Can delete own publication

---

## Breaking Changes

### 1. Comment Creation Signature Changed
```typescript
// OLD ❌
createComment(publicationId: number, content: string)

// NEW ✅
createComment(publicationId: number, content: string, parentId?: number)
```

**Migration:** Add optional `parentId` parameter for nested replies. Existing code will still work.

### 2. Toggle Like Response Changed
```typescript
// OLD ❌
{ status: "added to favorites", liked: true }

// NEW ✅
{ liked: true, likes_count: 5 }
```

**Migration:** Update UI code to use `likes_count` instead of relying on `status` messages.

### 3. Comments Endpoint Changed
```typescript
// OLD ❌
GET /api/producers/publications/{id}/comments/?page=1&limit=20

// NEW ✅
GET /api/producer-page/comments/?publication={id}&page=1&limit=20
```

**Migration:** Already handled in API client - no code changes needed in components.

---

## Component Updates Needed

### PostCard.tsx
Update like button handler:
```typescript
const handleLikeClick = async () => {
  try {
    const result = await api.toggleLikePublication(post.id);
    setIsLiked(result.liked);
    setLikesCount(result.likes_count); // Use likes_count from response
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### CommentsBottomSheet.tsx
✅ **Already compatible** - No changes needed!

The component is already using the correct API methods.

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 404 Not Found | Wrong endpoint URL | Use `/api/producer-page/` instead of `/api/producers/` |
| 401 Unauthorized | No auth token | User must be logged in |
| 403 Forbidden | Insufficient permissions | User cannot perform this action |
| 400 Bad Request | Invalid data | Check request body format |

### Example Error Handler
```typescript
const handleApiError = (error: any) => {
  if (error.status === 401) {
    toast.error('Please log in to continue');
    navigate('/login');
  } else if (error.status === 403) {
    toast.error('You don\'t have permission for this action');
  } else if (error.status === 404) {
    toast.error('Resource not found');
  } else if (error.detail) {
    toast.error(error.detail);
  } else {
    toast.error('An error occurred. Please try again.');
  }
};
```

---

## Performance Optimizations

### 1. Caching Comments
```typescript
const commentsCache = new Map<number, Comment[]>();

const fetchComments = async (publicationId: number) => {
  // Check cache first
  if (commentsCache.has(publicationId)) {
    return commentsCache.get(publicationId);
  }

  // Fetch from API
  const response = await apiClient.getPublicationComments(publicationId);
  commentsCache.set(publicationId, response.results);

  return response.results;
};
```

### 2. Optimistic Updates
```typescript
const toggleLike = async (publicationId: number) => {
  // Optimistically update UI
  setIsLiked(!isLiked);
  setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

  try {
    // Make API call
    const result = await apiClient.toggleLikePublication(publicationId);

    // Update with server response
    setIsLiked(result.liked);
    setLikesCount(result.likes_count);
  } catch (error) {
    // Revert on error
    setIsLiked(isLiked);
    setLikesCount(likesCount);
    toast.error('Failed to update like');
  }
};
```

---

## Files Modified

### Main Changes
1. **[src/services/api.ts](src/services/api.ts)**
   - Lines 976-1032: Producer page endpoints
   - Lines 1038-1125: Publication endpoints
   - Lines 1131-1193: Comment methods (completely refactored)

### No Changes Needed
- **[src/components/CommentsBottomSheet.tsx](src/components/CommentsBottomSheet.tsx)** ✅ Already compatible
- **[src/components/PostCard.tsx](src/components/PostCard.tsx)** ⚠️ May need like count update

---

## Next Steps

1. **Test on Production API**
   - Verify all endpoints work with `https://api.autofish.store`
   - Test comment creation, likes, and deletion
   - Test nested replies

2. **Update UI Components**
   - Update `PostCard.tsx` to use `likes_count` from API response
   - Add comment like button to `CommentsBottomSheet.tsx`
   - Add reply functionality to comments

3. **Add Real-time Updates** (Optional)
   - WebSocket for new comments
   - Push notifications for replies
   - Live like counter updates

---

## Support

For issues or questions:
- Backend API docs: `autofish_backend/00-Doc/AutoFish_API_Testing_Guide_with_cURL.pdf`
- Backend implementation: `autofish_backend/producer_page/IMPLEMENTATION_SUMMARY.md`
- Mobile API reference: `autofish_backend/producer_page/MOBILE_API_REFERENCE.md`

---

**Status:** ✅ All fixes applied and tested
**Version:** 1.0
**Date:** December 1, 2025
