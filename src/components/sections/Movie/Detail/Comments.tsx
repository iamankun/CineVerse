import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import CommentList from "@/components/ui/comments/CommentList";
import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";

interface CommentsSectionProps {
  movieId: number;
}

export default function CommentsSection({ movieId }: CommentsSectionProps) {
  // TODO: Get current user from auth context
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Try to get user profile
          let profile = null;
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', user.id)
              .single();
            profile = profileData;
          } catch (error) {
            // Profile not found, create one
          }

          // Create profile if not exists
          if (!profile) {
            const { data: newProfile, error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                username: user.email?.split('@')[0] || 'Anonymous',
                full_name: user.email?.split('@')[0] || 'Anonymous',
                avatar_url: null,
              })
              .select('username, avatar_url')
              .single();

            if (profileError) {
              // Continue with fallback data
              profile = { username: user.email?.split('@')[0] || 'Anonymous', avatar_url: null };
            } else {
              profile = newProfile;
            }
          }

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
        movieId={movieId}
        currentUser={currentUser}
      />
    </section>
  );
}
