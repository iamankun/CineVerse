import { useState } from "react";
import { Comment as CommentType, CommentWithReplies } from "@/types/comment";
import { Button, Input, Textarea, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { FiThumbsUp, FiThumbsDown, FiMessageSquare, FiMoreHorizontal, FiEdit, FiTrash2 } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface CommentProps {
  comment: CommentType | CommentWithReplies;
  movieId?: number;
  tvId?: number;
  onReply?: (parentId: string, username: string) => void;
  onEdit?: (comment: CommentType) => void;
  onDelete?: (id: string) => void;
  currentUserId?: string;
  isReply?: boolean;
  likeComment?: (commentId: string) => Promise<any>;
  dislikeComment?: (commentId: string) => Promise<any>;
  isLiking?: boolean;
  isDisliking?: boolean;
}

export default function Comment({
  comment,
  movieId,
  tvId,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
  isReply = false,
  likeComment,
  dislikeComment,
  isLiking = false,
  isDisliking = false,
}: CommentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const isOwner = currentUserId === comment.user_id;
  const hasReplies = 'replies' in comment && comment.replies && comment.replies.length > 0;

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "vừa xong";
    }
  };

  const handleLike = async () => {
    if (!likeComment) return;
    
    try {
      await likeComment(comment.id);
      console.log("Comment liked successfully");
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDislike = async () => {
    if (!dislikeComment) return;
    
    try {
      await dislikeComment(comment.id);
      console.log("Comment disliked successfully");
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  return (
    <div className={`${isReply ? "ml-12" : ""} mb-4`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar
          src={comment.user_avatar || undefined}
          name={comment.username}
          size={isReply ? "sm" : "md"}
          className="flex-shrink-0"
        />

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
              {comment.username || 'NO_USERNAME'}
            </span>
            <span className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</span>
            {comment.is_pinned && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                📌 Đã ghim
              </span>
            )}
          </div>

          {/* Content */}
          <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
            {isExpanded || comment.content.length <= 300 ? (
              comment.content || 'NO_CONTENT_DISPLAY'
            ) : (
              <>
                {comment.content.substring(0, 300)}...
                <Button
                  size="sm"
                  variant="light"
                  className="ml-1 p-0 h-auto min-w-0 text-xs"
                  onClick={() => setIsExpanded(true)}
                >
                  Xem thêm
                </Button>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            {/* Like/Dislike */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="light"
                className="p-1 min-w-0 h-6 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                onClick={handleLike}
                disabled={isLiking || isDisliking}
                startContent={<FiThumbsUp className="w-4 h-4" />}
              >
                <span className="text-xs">{comment.likes || 0}</span>
              </Button>
              <Button
                size="sm"
                variant="light"
                className="p-1 min-w-0 h-6 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                onClick={handleDislike}
                disabled={isLiking || isDisliking}
                startContent={<FiThumbsDown className="w-4 h-4" />}
              >
                <span className="text-xs">{comment.dislikes || 0}</span>
              </Button>
            </div>

            {/* Reply */}
            <Button
              size="sm"
              variant="light"
              className="p-1 min-w-0 h-6 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              onClick={() => onReply?.(comment.id, comment.username)}
              startContent={<FiMessageSquare className="w-4 h-4" />}
            >
              Phản hồi
            </Button>

            {/* Edit/Delete for owner */}
            {isOwner && (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    size="sm"
                    variant="light"
                    className="p-1 min-w-0 h-6 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    isIconOnly
                  >
                    <FiMoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Comment actions">
                  <DropdownItem
                    key="edit"
                    startContent={<FiEdit className="w-4 h-4" />}
                    onClick={() => onEdit?.(comment)}
                  >
                    Chỉnh sửa
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    startContent={<FiTrash2 className="w-4 h-4" />}
                    onClick={() => onDelete?.(comment.id)}
                  >
                    Xóa
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>

          {/* Replies */}
          {hasReplies && (
            <div className="mt-3">
              {!showReplies && (
                <Button
                  size="sm"
                  variant="light"
                  className="text-xs p-0 h-auto min-w-0"
                  onClick={() => setShowReplies(true)}
                  startContent={
                    <FiMessageSquare className="w-3 h-3" />
                  }
                >
                  Xem {comment.replies!.length} phản hồi
                </Button>
              )}

              {showReplies && (
                <div className="space-y-3">
                  {comment.replies!.map((reply) => (
                    <Comment
                      key={reply.id}
                      comment={reply}
                      movieId={movieId}
                      tvId={tvId}
                      onReply={onReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      currentUserId={currentUserId}
                      isReply={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
