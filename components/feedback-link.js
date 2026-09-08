"use client";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export default function FeedbackLink(){const pathname=usePathname();return <Link className="help-feedback-link" href={`/help/feedback/?from=${encodeURIComponent(pathname || '/')}`}>反馈此页的使用问题 ↗</Link>;}
