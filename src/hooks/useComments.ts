import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommentWithReplies, CreateCommentRequest, UpdateCommentRequest } from "@/types/comment";

interface UseCommentsProps {
  movieId?: number;
  tvId?: number;
  page?: number;
  limit?: number;
}

export function useComments({ movieId, tvId, page = 1, limit = 20 }: UseCommentsProps) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["comments", movieId, tvId, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (movieId) params.append("movie_id", movieId.toString());
      if (tvId) params.append("tv_id", tvId.toString());

      const response = await fetch(`/api/comments?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      return response.json();
    },
    enabled: !!(movieId || tvId),
    staleTime: 30000, // 30 seconds
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentRequest) => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Important for cookies
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create comment");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", movieId, tvId],
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCommentRequest }) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update comment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", movieId, tvId],
      });
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to like comment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", movieId, tvId],
      });
    },
  });

  const dislikeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/comments/${commentId}/dislike`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to dislike comment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", movieId, tvId],
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting comment with ID:', id);
      
      const response = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.log('Delete error response:', error);
        throw new Error(error.error || "Failed to delete comment");
      }

      const result = await response.json();
      console.log('Delete success response:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", movieId, tvId],
      });
    },
  });

  return {
    comments: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    createComment: createCommentMutation.mutateAsync,
    updateComment: updateCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    likeComment: likeCommentMutation.mutateAsync,
    dislikeComment: dislikeCommentMutation.mutateAsync,
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    isLiking: likeCommentMutation.isPending,
    isDisliking: dislikeCommentMutation.isPending,
  };
}
