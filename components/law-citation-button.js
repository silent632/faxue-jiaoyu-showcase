'use client';

import { useState } from 'react';

export default function LawCitationButton({ title, version, label }) {
  const citation = `${title}（${version}）${label}`;
  const [copyStatus, setCopyStatus] = useState('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(citation);
      setCopyStatus('已复制法条引文');
    } catch {
      setCopyStatus('请手动复制：' + citation);
    }
  }

  return <span className="law-citation">
    <button className="btn btn-outline" type="button" onClick={copy}>复制引文</button>
    {copyStatus && <span role="status">{copyStatus}</span>}
  </span>;
}
