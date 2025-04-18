import axios from 'axios';

/**
 * YouTube tutorial link verification
 * This utility helps verify that YouTube videos are valid and playable
 */

/**
 * Extracts the YouTube video ID from various YouTube URL formats
 * Works with standard, shortened, and embed URLs
 */
export function extractYouTubeVideoId(url: string): string | null {
  // Handle null or undefined URLs
  if (!url) return null;

  // Standard YouTube URL pattern
  let match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (match && match[1]) return match[1];

  // Direct embed URL pattern
  match = url.match(/youtube.com\/embed\/([^"&?\/\s]{11})/);
  if (match && match[1]) return match[1];

  // Already a video ID (11 characters)
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;

  return null;
}

/**
 * Creates a valid YouTube embed URL from various URL formats
 */
export function createEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Verifies if a YouTube video exists and is available
 * Returns true if the video is available, false otherwise
 */
export async function verifyYouTubeVideo(url: string): Promise<boolean> {
  try {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return false;
    
    // Use the oEmbed endpoint to check if the video exists
    // This is a lightweight way to verify without using the YouTube API key
    const response = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    
    return response.status === 200;
  } catch (error) {
    // If the request fails, the video likely doesn't exist or is private/removed
    console.error(`Failed to verify YouTube video: ${url}`, error);
    return false;
  }
}

/**
 * Takes an array of YouTube URLs and returns only the valid ones
 */
export async function filterValidYouTubeVideos(urls: string[]): Promise<string[]> {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const isValid = await verifyYouTubeVideo(url);
      return isValid ? url : null;
    })
  );
  
  return results
    .filter((result): result is PromiseFulfilledResult<string> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value);
}

/**
 * Gets a fallback YouTube embed URL if the provided one is invalid
 * Based on the category, returns a default tutorial video
 */
export async function getFallbackYouTubeUrl(url: string, category: string): Promise<string> {
  // Try to verify the provided URL first
  const isValid = await verifyYouTubeVideo(url);
  if (isValid) return url;
  
  // Default fallback videos by category
  const fallbacks: Record<string, string[]> = {
    foundation: [
      'https://www.youtube.com/embed/mLN4RM-m7yg', // Fenty foundation tutorial
      'https://www.youtube.com/embed/HPx5zZk_45Q', // Sephora foundation tutorial
      'https://www.youtube.com/embed/ZCbeHxnGcUk'  // Wayne Goss foundation tips
    ],
    concealer: [
      'https://www.youtube.com/embed/v2D-ZQVlk0s', // Sephora concealer tutorial
      'https://www.youtube.com/embed/RN5456ORMxI', // Alexandra Anele concealer tutorial
      'https://www.youtube.com/embed/2DDFFuENqYA'  // NikkieTutorials concealer tips
    ],
    blush: [
      'https://www.youtube.com/embed/sRg20WYF-fI', // Charlotte Tilbury blush tutorial
      'https://www.youtube.com/embed/BHqkEjfHYQ8', // Robert Welsh blush application
      'https://www.youtube.com/embed/qBJeAp7Vfe4'  // Rare Beauty blush tutorial
    ],
    eyeshadow: [
      'https://www.youtube.com/embed/ajjIzvbPsUI', // Selena Gomez eyeshadow tutorial
      'https://www.youtube.com/embed/W4W-4VL1ABU', // Lisa Eldridge eyeshadow tutorial
      'https://www.youtube.com/embed/W9bdkMykNEM'  // Basic eyeshadow tutorial
    ],
    lipstick: [
      'https://www.youtube.com/embed/vYAq-sA-DUM', // MAC lipstick application
      'https://www.youtube.com/embed/0LZX6mGKJys', // Charlotte Tilbury lipstick application
      'https://www.youtube.com/embed/aWq0oO6fHxQ'  // Sephora lipstick tutorial
    ]
  };
  
  // Get the appropriate fallback list based on category (default to foundation)
  const fallbackList = fallbacks[category.toLowerCase()] || fallbacks.foundation;
  
  // Try each fallback URL until a valid one is found
  for (const fallbackUrl of fallbackList) {
    const isValidFallback = await verifyYouTubeVideo(fallbackUrl);
    if (isValidFallback) return fallbackUrl;
  }
  
  // If all fallbacks fail, return the most reliable default
  return 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // Last resort fallback
}