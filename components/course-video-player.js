'use client';

import { useRef, useState } from 'react';

export default function CourseVideoPlayer({ source, period }) {
  const video = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  async function play() {
    try {
      await video.current.play();
      setReady(true);
    } catch {
      setFailed(true);
    }
  }

  return (
    <div className="course-video-screen">
      <video ref={video} className="showcase-video-player-element" controls={ready} preload="none" playsInline
        onPlay={() => { setReady(true); setFailed(false); }} onError={() => { setReady(false); setFailed(true); }}>
        <source src={source} type="video/mp4" />
        当前浏览器无法播放此视频。
      </video>
      {!ready && <div className="course-video-cover">
        {failed ? <p role="status">播放器暂时无法加载，请尝试打开原始视频。</p> : <>
          <span>{period} · 课程视频</span>
          <button className="course-video-play" type="button" onClick={play}>▶ 播放本期视频</button>
        </>}
      </div>}
    </div>
  );
}
