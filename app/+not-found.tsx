import { Redirect } from 'expo-router';

/** Any unknown path (e.g. when hosted under a sub-path) goes to the entry gate. */
export default function NotFound() {
  return <Redirect href="/" />;
}
