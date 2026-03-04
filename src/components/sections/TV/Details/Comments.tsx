import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import CommentList from "@/components/ui/comments/CommentList";
import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";

interface CommentsSectionProps {
  tvId: number;
}

export default function TVCommentsSection({ tvId }: CommentsSectionProps) {
  // TODO: Get current user from auth context
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

          setCurrentUser({
            id: user.id,
            username: (profile as any)?.username || user.email?.split('@')[0] || 'Anonymous',
            avatar_url: (profile as any)?.avatar_url,
          });
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex justify-center">
          <Icon icon="solar:loader-circle-bold" className="w-8 h-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <section id="comments" className="scroll-mt-20">
      <CommentList
        tvId={tvId}
        currentUser={currentUser}
      />
    </section>
  );
}
