'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { learningContextHref } from '@/lib/learning-context.js';

export default function LearningContextLink({ href, allowedTopics = [], children, ...props }) {
  const [target, setTarget] = useState(href);
  useEffect(() => {
    setTarget(learningContextHref(href, window.location.search, allowedTopics));
  }, [href, allowedTopics]);
  return <Link href={target} {...props}>{children}</Link>;
}
