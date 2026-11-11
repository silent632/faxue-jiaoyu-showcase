'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// 真实三维空间只负责观察，角色、材料和学习记录仍由同一套文字界面控制。
export default function HearingRoom3D({ activeRole }) {
  const container = useRef(null); const rendererRef = useRef(null); const view = useRef({ angle: 0, elevation: 0.45, distance: 12 });
  const [available, setAvailable] = useState(true); const drawRef = useRef(() => {});
  useEffect(() => {
    const host = container.current; if (!host) return;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' }); }
    catch { setAvailable(false); return; }
    rendererRef.current = renderer; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setClearColor(0x172b3b); host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(42, 1, .1, 80);
    scene.add(new THREE.HemisphereLight(0xeaf4ff, 0x574432, 2)); const light = new THREE.DirectionalLight(0xffe3b5, 2); light.position.set(1, 8, 5); scene.add(light);
    const geometries = []; const materials = [];
    function box(size, pos, color) { const geo = new THREE.BoxGeometry(...size); const mat = new THREE.MeshStandardMaterial({ color, roughness: .85 }); geometries.push(geo); materials.push(mat); const mesh = new THREE.Mesh(geo, mat); mesh.position.set(...pos); scene.add(mesh); return mesh; }
    box([11, .3, 8], [0, -.2, 0], 0x78583f); box([11, 5, .25], [0, 2.4, -4], 0x304a59); box([.2, 5, 8], [-5.5, 2.4, 0], 0x253e4c); box([.2, 5, 8], [5.5, 2.4, 0], 0x253e4c);
    box([4.6, .25, 1.4], [0, .9, -1.9], 0xa77b50); box([4.2, .8, .2], [0, .45, -2.45], 0x65452f);
    box([5.5, .25, 1.8], [0, .85, 1.4], 0x9e7149); for (const x of [-2.2,2.2]) box([.25,.85,.25],[x,.4,1.4],0x543725);
    function person(x,z,shirt) { box([.5,.5,.5],[x,2.25,z],0xdcb999); box([.8,1,.45],[x,1.5,z],shirt); box([1,.14,.8],[x,.75,z],0x654a38); }
    person(0,-2.7,0x294e68); person(-2.9,.7,activeRole==='student'?0xc9a351:0x395e74); person(2.9,.7,activeRole==='management'?0xc9a351:0x395e74);
    box([.8,.06,.55],[-1,.99,1.4],0xf5e6cb); box([.8,.06,.55],[1,.99,1.4],0xf5e6cb);
    function render() { if (!container.current) return; const width=host.clientWidth || 300, height=host.clientHeight || 260; renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix(); const {angle,elevation,distance}=view.current; camera.position.set(Math.sin(angle)*distance, 2+Math.sin(elevation)*distance, Math.cos(angle)*distance); camera.lookAt(0,1,0); renderer.render(scene,camera); }
    drawRef.current=render; const observer = new ResizeObserver(render); observer.observe(host); render();
    const lost = event => { event.preventDefault(); setAvailable(false); }; renderer.domElement.addEventListener('webglcontextlost',lost);
    return () => { observer.disconnect(); renderer.domElement.removeEventListener('webglcontextlost',lost); geometries.forEach(item=>item.dispose()); materials.forEach(item=>item.dispose()); renderer.dispose(); renderer.domElement.remove(); rendererRef.current=null; drawRef.current=()=>{}; };
  }, [activeRole]);
  function rotate(delta) { view.current.angle += delta; drawRef.current(); }
  const drag = useRef(null);
  if (!available) return <p className="console-muted">当前设备无法显示三维画面，可继续使用下方场景和文字操作。</p>;
  return <div className="hearing-3d"><div className="hearing-3d-canvas" ref={container} role="img" aria-label="三维听证室，含主持席、学生代表、管理方案代表和材料桌" onPointerDown={event=>{drag.current={x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={event=>{if(!drag.current)return;view.current.angle+=(event.clientX-drag.current.x)*.008;view.current.elevation=Math.max(.15,Math.min(.9,view.current.elevation+(event.clientY-drag.current.y)*.004));drag.current={x:event.clientX,y:event.clientY};drawRef.current();}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}/>
    <p className="console-muted">拖动画面观察听证室；也可以使用按钮旋转视角。选择角色和阅读材料请使用下方操作。</p><div className="console-actions"><button type="button" className="btn btn-outline" onClick={()=>rotate(-.3)}>向左旋转</button><button type="button" className="btn btn-outline" onClick={()=>rotate(.3)}>向右旋转</button><button type="button" className="btn btn-outline" onClick={()=>{view.current={angle:0,elevation:.45,distance:12};drawRef.current();}}>重置视角</button></div></div>;
}
