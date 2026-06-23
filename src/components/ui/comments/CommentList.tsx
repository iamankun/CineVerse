import { useState, useEffect } from "react";
import { useComments } from "@/hooks/useComments";
import { CommentWithReplies, UpdateCommentRequest } from "@/types/comment";
import { Button, Card, Spinner, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

interface CommentListProps {
  movieId?: number;
  tvId?: number;
  currentUser?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export default function CommentList({ movieId, tvId, currentUser }: CommentListProps) {
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [editingComment, setEditingComment] = useState<CommentWithReplies | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest");

  const {
    comments,
    total,
    isLoading,
    error,
    refetch,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    dislikeComment,
    isCreating,
    isUpdating,
    isDeleting,
    isLiking,
    isDisliking,
  } = useComments({ movieId, tvId });

  const handleCreateComment = async (data: any) => {
    await createComment(data);
    setReplyTo(null);
  };

  const handleUpdateComment = async (data: UpdateCommentRequest) => {
    if (editingComment) {
      await updateComment({ id: editingComment.id, data });
      setEditingComment(null);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      await deleteComment(id);
    }
  };

  const handleReply = (parentId: string, username: string) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để bình luận");
      return;
    }
    setReplyTo({ id: parentId, username });
    setEditingComment(null);
  };

  const handleEdit = (comment: CommentWithReplies) => {
    setEditingComment(comment);
    setReplyTo(null);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <Icon icon="solar:danger-circle-bold" className="w-12 h-12 mx-auto mb-2" />
          <p>Không thể tải bình luận. Vui lòng thử lại.</p>
          <Button size="sm" variant="light" onClick={() => refetch()} className="mt-2">
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">
            Bình luận ({total || 0})
          </h3>
          
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sắp xếp:</span>
            <Button
              size="sm"
              variant={sortBy === "newest" ? "solid" : "light"}
              onClick={() => setSortBy("newest")}
            >
              Mới nhất
            </Button>
            <Button
              size="sm"
              variant={sortBy === "popular" ? "solid" : "light"}
              onClick={() => setSortBy("popular")}
            >
              Phổ biến
            </Button>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      {currentUser && (
        <CommentForm
          movieId={movieId}
          tvId={tvId}
          onSubmit={handleCreateComment}
          isSubmitting={isCreating}
          currentUser={currentUser}
          placeholder="Viết bình luận công khai..."
        />
      )}

      {!currentUser && (
        <Card className="p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            <Icon icon="solar:login-3-bold" className="w-5 h-5 inline mr-2" />
            Đăng nhập để tham gia bình luận
          </p>
        </Card>
      )}

      <Divider />

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : comments.length === 0 ? (
          <Card className="p-8 text-center">
            <Icon icon="solar:chat-square-like-bold" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </p>
          </Card>
        ) : (
          <>
            {/* Edit Form */}
            {editingComment && (
              <CommentForm
                movieId={movieId}
                tvId={tvId}
                initialContent={editingComment.content}
                onSubmit={handleUpdateComment}
                onCancel={handleCancelEdit}
                isEditing={true}
                isSubmitting={isUpdating}
                currentUser={currentUser}
              />
            )}

            {/* Reply Form */}
            {replyTo && (
              <CommentForm
                movieId={movieId}
                tvId={tvId}
                parentId={replyTo.id}
                onSubmit={handleCreateComment}
                onCancel={handleCancelReply}
                isSubmitting={isCreating}
                currentUser={currentUser}
                placeholder={`Viết phản hồi tới ${replyTo.username}...`}
                replyToUsername={replyTo.username}
              />
            )}

            {/* Comments */}
            {comments.map((comment: CommentWithReplies, index: number) => {
              return (
                <Comment
                  key={comment.id}
                  comment={comment}
                  movieId={movieId}
                  tvId={tvId}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDeleteComment}
                  currentUserId={currentUser?.id}
                  likeComment={likeComment}
                  dislikeComment={dislikeComment}
                  isLiking={isLiking}
                  isDisliking={isDisliking}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Load More */}
      {comments.length > 0 && comments.length < total && (
        <div className="flex justify-center">
          <Button
            variant="light"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : "Tải thêm bình luận"}
          </Button>
        </div>
      )}
    </div>
  );
}
