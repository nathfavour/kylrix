import { redirect } from 'next/navigation';
import { getEcosystemUrl } from '@/lib/ecosystem';

export default function UserProfileRedirectPage({
  params,
}: {
  params: { username: string };
}) {
  redirect(`${getEcosystemUrl('connect')}/u/${encodeURIComponent(params.username)}`);
}
