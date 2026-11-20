'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { caseOrigin, studyContextHref } from '@/lib/study-law-context.js';

export default function CaseReturnLink({ studyUrl }) {
  const router = useRouter();
  const [target, setTarget] = useState(() => caseOrigin(""));
  useEffect(() => {
    setTarget(caseOrigin(window.location.search));
    if (studyUrl && /^#page=\d+$/u.test(window.location.hash)) {
      router.replace(studyContextHref(studyUrl + window.location.hash, window.location.search));
    }
  }, [router, studyUrl]);
  return <Link className="btn btn-ghost case-detail-back-btn" href={target.href}>{target.label}</Link>;
}
