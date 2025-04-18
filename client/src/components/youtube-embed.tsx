import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, AlertCircle } from 'lucide-react';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
  category?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | '1:1' | '16:9' | '4:3';
}

export function YouTubeEmbed({ 
  url, 
  title = 'Tutorial Video', 
  category = 'foundation',
  className = '',
  aspectRatio = 'video'
}: YouTubeEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError('No video URL provided');
      setIsLoading(false);
      return;
    }

    async function verifyAndSetYouTubeUrl() {
      try {
        setIsLoading(true);
        setError(null);

        // Call our API to verify the YouTube URL
        const response = await apiRequest(
          'POST', 
          '/api/verify-youtube', 
          { url, category }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to verify video');
        }

        const data = await response.json();
        setEmbedUrl(data.embedUrl);
      } catch (err) {
        setError((err as Error).message || 'Failed to load video');
        console.error('YouTube embed error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    verifyAndSetYouTubeUrl();
  }, [url, category]);

  // Different aspect ratio classes
  const aspectRatioClass = 
    aspectRatio === 'square' || aspectRatio === '1:1' 
      ? 'aspect-square' 
      : aspectRatio === '4:3' 
        ? 'aspect-[4/3]' 
        : 'aspect-video'; // 16:9 is the default

  // Render loading state
  if (isLoading) {
    return (
      <div className={`${aspectRatioClass} bg-muted/50 flex items-center justify-center ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      </div>
    );
  }

  // Render error state
  if (error || !embedUrl) {
    return (
      <div className={`${aspectRatioClass} bg-muted/20 border border-muted flex flex-col items-center justify-center p-4 ${className}`}>
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          {error || 'Video unavailable'}
        </p>
      </div>
    );
  }

  // Render the YouTube embed
  return (
    <div className={`${aspectRatioClass} ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-md"
      />
    </div>
  );
}