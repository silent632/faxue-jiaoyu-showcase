'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CaseReturnLink() {
  const [href, setHref] = useState('/cases/');
  useEffect(() => {
    const previous = new URLSearchParams(window.location.search).get('returnTo') || '';
    if (previous.startsWith('/cases/?') && previous.length <= 2000 && !/[\u0000-\u001f\\]/.test(previous)) setHref(previous);
  }, []);
  return <Link className="btn btn-ghost case-detail-back-btn" href={href}>← 返回案例检索</Link>;
}
