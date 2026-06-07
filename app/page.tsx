import { redirect } from 'next/navigation';

/** Fallback only — middleware should redirect `/` before this runs. */
export default function RootLanding() {
  redirect('/send');
}
