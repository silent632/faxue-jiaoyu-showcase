'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { studyContextHref } from "@/lib/study-law-context.js";
import { learningContextHref } from '@/lib/learning-context.js';

export default function LearningContextLink({ href, allowedTopics = [], carrySource = false, children, ...props }) {
  const [target, setTarget] = useState(href);
  useEffect(() => {
    setTarget(carrySource ? studyContextHref(href, window.location.search) : learningContextHref(href, window.location.search, allowedTopics));
  }, [href, allowedTopics, carrySource]);
  return <Link href={target} {...props}>{children}</Link>;
}
