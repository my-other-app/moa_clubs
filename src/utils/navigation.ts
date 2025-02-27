'use client';

import { useRouter } from 'next/router';

export function useNavigate() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return { navigateTo };
}
