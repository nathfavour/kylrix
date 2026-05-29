import type { Metadata } from 'next';
import { SendReceiveClient } from '@/components/send/SendReceiveClient';
import { validatePublicNoteAccess } from '@/lib/appwrite';
import { parseSendGhostMetadata } from '@/lib/send/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ noteId: string; key?: string[] }>;
}): Promise<Metadata> {
  try {
    const { noteId, key } = await params;
    const keyParam = key?.join('/') || undefined;

    if (keyParam) {
      return {
        title: 'Secure Sharing · Kylrix',
        description: 'This shared link is private and secure.',
      };
    }

    const note = await validatePublicNoteAccess(noteId);
    if (!note) {
      return {
        title: 'Secure Sharing · Kylrix',
        description: 'View shared notes, files, passwords, and more securely.',
      };
    }

    const meta = parseSendGhostMetadata(note.metadata);
    const isEncrypted = note.isEncrypted === true || meta.isEncrypted === true;

    if (isEncrypted) {
      return {
        title: 'Secure Shared Note · Kylrix',
        description: 'This is a private and secure note. Enter the key to view.',
      };
    }

    const titleText = note.title || 'Shared Note';
    const kind = meta.send_object?.kind || 'note';

    let displayTitle = `${titleText} · Kylrix`;
    let displayDesc = note.content
      ? note.content.substring(0, 160).trim() + '…'
      : 'This is a secure note shared via Kylrix Send.';

    if (kind === 'file') {
      displayTitle = `Shared File: ${titleText} · Kylrix`;
      displayDesc = 'Download this file shared securely via Kylrix Send.';
    } else if (kind === 'task') {
      displayTitle = `Shared Task: ${titleText} · Kylrix`;
      displayDesc = note.content
        ? note.content.substring(0, 160).trim() + '…'
        : 'View this task shared securely via Kylrix Send.';
    }

    return {
      title: displayTitle,
      description: displayDesc,
    };
  } catch (error) {
    console.error('Error generating metadata for Send:', error);
    return {
      title: 'Secure Sharing · Kylrix',
      description: 'View shared notes, files, passwords, and more securely.',
    };
  }
}

export default async function SendReceivePage({
  params,
}: {
  params: Promise<{ noteId: string; key?: string[] }>;
}) {
  const { noteId, key } = await params;
  const keyParam = key?.join('/') || undefined;

  if (!noteId) return null;

  return <SendReceiveClient noteId={noteId} keyParam={keyParam} />;
}
