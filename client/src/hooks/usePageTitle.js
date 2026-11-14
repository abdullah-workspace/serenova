import { useEffect } from 'react';
export function usePageTitle(title) {
  useEffect(() => { document.title = `${title} | Serenova Clinic`; }, [title]);
}
