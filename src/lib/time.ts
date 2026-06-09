/**
 * Converts a timestamp string or Date into a human-readable relative time in Hindi.
 * Example: "2 मिनट पहले", "1 घंटा पहले"
 */
export function getRelativeTimeHindi(dateString: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "अभी";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} मिनट पहले`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'घंटा' : 'घंटे'} पहले`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "कल";
  }
  
  if (diffInDays < 7) {
    return `${diffInDays} दिन पहले`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} सप्ताह पहले`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} महीने पहले`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} साल पहले`;
}
