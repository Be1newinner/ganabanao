"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The landing page's 3D centrepiece: a spinning vinyl record whose label is a
 * Madhubani painting, lit by orbiting saffron, rose and violet lights, inside a
 * ring of sound-wave particles. Tilts toward the cursor and turns with scroll.
 * Pauses when off screen; renders a still frame when reduced motion is on.
 */

const LIGHTS = [0xf6b444, 0xee6a8a, 0x7c52f0];

/** Vinyl face: grooves, sheen and the painted label in the middle. */
function drawRecordFace(label: HTMLImageElement | null): HTMLCanvasElement {
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const mid = size / 2;

  g.fillStyle = "#0d0b10";
  g.beginPath();
  g.arc(mid, mid, mid, 0, Math.PI * 2);
  g.fill();

  // Grooves: many faint concentric rings with slight brightness variation
  for (let r = mid - 8; r > mid * 0.36; r -= 2.2) {
    g.strokeStyle = `rgba(255,255,255,${0.025 + Math.random() * 0.035})`;
    g.lineWidth = 1;
    g.beginPath();
    g.arc(mid, mid, r, 0, Math.PI * 2);
    g.stroke();
  }
  // Two track gaps
  for (const r of [mid * 0.62, mid * 0.82]) {
    g.strokeStyle = "rgba(0,0,0,0.8)";
    g.lineWidth = 5;
    g.beginPath();
    g.arc(mid, mid, r, 0, Math.PI * 2);
    g.stroke();
  }

  // Label
  const lr = mid * 0.34;
  g.save();
  g.beginPath();
  g.arc(mid, mid, lr, 0, Math.PI * 2);
  g.clip();
  if (label) g.drawImage(label, mid - lr, mid - lr, lr * 2, lr * 2);
  else {
    g.fillStyle = "#e3b04b";
    g.fillRect(mid - lr, mid - lr, lr * 2, lr * 2);
  }
  g.restore();
  g.strokeStyle = "rgba(0,0,0,0.55)";
  g.lineWidth = 6;
  g.beginPath();
  g.arc(mid, mid, lr, 0, Math.PI * 2);
  g.stroke();

  // Spindle hole
  g.fillStyle = "#050406";
  g.beginPath();
  g.arc(mid, mid, 12, 0, Math.PI * 2);
  g.fill();
  return c;
}

export default function VinylScene({ labelSrc }: { labelSrc: string }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 9.5);

    // ── Record ──
    const group = new THREE.Group();
    group.rotation.x = -0.55;
    scene.add(group);

    const faceTexture = new THREE.CanvasTexture(drawRecordFace(null));
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // The face lights itself a little (emissive) so the painted label reads on a dark page
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      emissiveMap: faceTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.32,
      roughness: 0.32,
      metalness: 0.35,
    });
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x0b0a0e, roughness: 0.4, metalness: 0.6 });
    const record = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.06, 160, 1), [edgeMat, faceMat, faceMat]);
    record.rotation.x = Math.PI / 2;
    group.add(record);

    const img = new Image();
    img.onload = () => {
      faceTexture.image = drawRecordFace(img);
      faceTexture.needsUpdate = true;
      if (reduced) renderer.render(scene, camera);
    };
    img.src = labelSrc;

    // ── Sound rings: particles rippling around the record ──
    const rings = small ? 3 : 5;
    const perRing = small ? 260 : 420;
    const count = rings * perRing;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const base = new Float32Array(count * 2); // angle, ring radius
    const palette = LIGHTS.map((h) => new THREE.Color(h));
    for (let r = 0; r < rings; r++) {
      for (let i = 0; i < perRing; i++) {
        const k = r * perRing + i;
        const a = (i / perRing) * Math.PI * 2;
        base[k * 2] = a;
        base[k * 2 + 1] = 2.35 + r * 0.32;
        const col = palette[0].clone().lerp(palette[1], i / perRing).lerp(palette[2], r / rings);
        colors.set([col.r, col.g, col.b], k * 3);
      }
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const pMat = new THREE.PointsMaterial({
      size: small ? 0.035 : 0.028,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xfff1dc, 0.55);
    key.position.set(-3, 4, 6);
    scene.add(key);
    // Coloured lights sweep across the grooves (physically based: needs high intensity)
    const lights = LIGHTS.map((hex) => {
      const l = new THREE.PointLight(hex, 90, 30, 1.4);
      scene.add(l);
      return l;
    });

    // ── Sizing ──
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // ── Interaction ──
    const target = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = (e.clientX / window.innerWidth - 0.5) * 0.5;
      target.y = (e.clientY / window.innerHeight - 0.5) * 0.35;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(host);

    const clock = new THREE.Clock();
    let frame = 0;
    const step = () => {
      const t = clock.getElapsedTime();

      record.rotation.y = -t * 0.9; // spin about the record's own axis
      group.rotation.y += (target.x - group.rotation.y) * 0.05;
      group.rotation.x += (-0.55 + target.y - window.scrollY * 0.0006 - group.rotation.x) * 0.05;

      const pos = pGeo.attributes.position.array as Float32Array;
      for (let k = 0; k < count; k++) {
        const a = base[k * 2] + t * 0.15;
        const ring = base[k * 2 + 1];
        const wave = Math.sin(a * 6 + t * 2.2 + ring * 3) * 0.08 + Math.sin(a * 13 - t * 3.1) * 0.04;
        const r = ring + wave;
        pos[k * 3] = Math.cos(a) * r;
        pos[k * 3 + 1] = Math.sin(a) * r;
        pos[k * 3 + 2] = wave * 1.5;
      }
      pGeo.attributes.position.needsUpdate = true;

      lights.forEach((l, i) => {
        const a = t * 0.5 + (i * Math.PI * 2) / lights.length;
        l.position.set(Math.cos(a) * 4.5, Math.sin(a) * 2.5 + 1, 3.2);
      });

      renderer.render(scene, camera);
    };
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (visible) step();
    };
    if (reduced) step();
    else loop();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      io.disconnect();
      pGeo.dispose();
      pMat.dispose();
      faceTexture.dispose();
      faceMat.dispose();
      edgeMat.dispose();
      record.geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [labelSrc]);

  return <div ref={mount} className="size-full" aria-hidden />;
}
