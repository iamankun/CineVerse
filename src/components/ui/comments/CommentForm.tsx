import { useState } from "react";
import { CreateCommentRequest, UpdateCommentRequest } from "@/types/comment";
import { Button, Textarea, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";

interface CommentFormProps {
  movieId?: number;
  tvId?: number;
  parentId?: string;
  initialContent?: string;
  onSubmit: (data: CreateCommentRequest | UpdateCommentRequest) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
  placeholder?: string;
  currentUser?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  replyToUsername?: string;
}

export default function CommentForm({
  movieId,
  tvId,
  parentId,
  initialContent = "",
  onSubmit,
  onCancel,
  isEditing = false,
  isSubmitting = false,
  placeholder = "Viết bình luận...",
  currentUser,
  replyToUsername,
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    if (!currentUser) return;

    try {
      if (isEditing) {
        await onSubmit({ content: content.trim() });
      } else {
        await onSubmit({
          movie_id: movieId,
          tv_id: tvId,
          content: content.trim(),
          parent_id: parentId,
        });
      }
      
      if (!isEditing) {
        setContent("");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    onCancel?.();
  };

  const isDisabled = !content.trim() || isSubmitting;

  return (
    <div className={`${parentId ? "ml-12" : ""} mb-4`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar
            src={currentUser?.avatar_url || undefined}
            name={currentUser?.username}
            size="md"
            className="flex-shrink-0"
          />

          {/* Form Content */}
          <div className="flex-1">
            {/* Reply indicator */}
            {replyToUsername && (
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Phản hồi <span className="font-semibold">@{replyToUsername}</span>
              </div>
            )}

            {/* Textarea */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              minRows={2}
              maxRows={8}
              className="w-full"
              variant="bordered"
              size="sm"
              disabled={isSubmitting}
            />

            {/* Actions */}
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">
                {content.length}/2000 ký tự
              </div>
              
              <div className="flex gap-2">
                {onCancel && (
                  <Button
                    size="sm"
                    variant="light"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                )}
                
                <Button
                  type="submit"
                  size="sm"
                  color="primary"
                  disabled={isDisabled}
                  isLoading={isSubmitting}
                >
                  {isEditing ? "Lưu" : "Bình luận"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
