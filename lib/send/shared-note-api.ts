/** Public note fetch used by shared note + Send receive flows (Next route lives under /app/api). */
export function sharedNotePublicUrl(noteId: string): string {
  return `/app/api/shared/${noteId}`;
}
