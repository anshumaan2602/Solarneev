// The 3D house in the hero: a two-storey home whose roof fills with panels as the estimate grows.
// Ported from the design on three.js r128, which it was drawn with (later releases changed
// lighting units, colour handling and shadow filtering). The picture is the design's; what differs
// is when it is drawn. Frames stop while the stage is off screen or, with reduced motion, once
// nothing moves. The shadow map is redrawn only while panels move. And the canvas keeps no copy
// of each frame (no preserveDrawingBuffer), which only the design tool needed.
// Loaded on demand by SolarStage, so three.js stays out of the page's first download.

import * as T from "three";
import { MAX_SCENE_PANELS, panelSlots } from "./roofLayout";

export interface SolarScene {
  /** Show this many panels on the roof (up to MAX_SCENE_PANELS), animating the change. */
  setPanels(n: number): void;
  /** Turn the camera around the house by this many radians. */
  nudge(radians: number): void;
  dispose(): void;
}

const ROOF = 6.5;

export function buildSolarScene(canvas: HTMLCanvasElement, stage: HTMLElement): SolarScene {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  // Only the panels move among the things that cast shadows, so redraw shadows only when they do.
  renderer.shadowMap.autoUpdate = false;

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, 0.5, 400);
  const bin: { dispose(): void }[] = [];
  const keep = <O extends { dispose(): void }>(o: O): O => {
    bin.push(o);
    return o;
  };

  const glowTex = (c0: string, c1: string) => {
    const cc = document.createElement("canvas");
    cc.width = 64;
    cc.height = 64;
    const g = cc.getContext("2d")!;
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, c0);
    gr.addColorStop(0.45, c0.replace(/[\d.]+\)$/, "0.5)"));
    gr.addColorStop(1, c1);
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    const t = new T.CanvasTexture(cc);
    t.encoding = T.sRGBEncoding;
    return t;
  };

  // Image-based lighting from a simple gradient sky with a bright sun.
  const pmrem = new T.PMREMGenerator(renderer);
  const envScene = new T.Scene();
  const skyGeo = new T.SphereGeometry(50, 32, 16);
  const skyCols: number[] = [];
  const sp = skyGeo.attributes.position;
  const cLow = new T.Color(0x5a4a3a);
  const cMid = new T.Color(0x3a6378);
  const cTop = new T.Color(0xc4d8ff);
  for (let i = 0; i < sp.count; i++) {
    const yy = sp.getY(i) / 50;
    const col = yy < 0 ? cLow.clone() : cMid.clone().lerp(cTop, Math.min(1, yy * 1.4));
    skyCols.push(col.r, col.g, col.b);
  }
  skyGeo.setAttribute("color", new T.Float32BufferAttribute(skyCols, 3));
  const skyMat = new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide });
  envScene.add(new T.Mesh(skyGeo, skyMat));
  const sunGeo = new T.SphereGeometry(5, 16, 8);
  const sunMat = new T.MeshBasicMaterial({ color: 0xfff0cc });
  const sunBlob = new T.Mesh(sunGeo, sunMat);
  sunBlob.position.set(-26, 30, 22);
  envScene.add(sunBlob);
  const envRT = pmrem.fromScene(envScene, 0.02);
  scene.environment = envRT.texture;
  skyGeo.dispose();
  skyMat.dispose();
  sunGeo.dispose();
  sunMat.dispose();
  pmrem.dispose();
  keep(envRT);

  scene.add(new T.HemisphereLight(0xd6e4ff, 0x5a4630, 0.35));
  const sun = new T.DirectionalLight(0xffe2b4, 1.65);
  sun.position.set(-12, 18, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera as T.OrthographicCamera;
  sc.left = -15;
  sc.right = 15;
  sc.top = 15;
  sc.bottom = -15;
  sc.near = 1;
  sc.far = 60;
  sc.updateProjectionMatrix();
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  const rim = new T.DirectionalLight(0x9db8ff, 0.4);
  rim.position.set(14, 8, -10);
  scene.add(rim);

  const mats: Record<string, T.MeshStandardMaterial> = {};
  const mat = (hex: number, o?: T.MeshStandardMaterialParameters) => {
    const k = hex + "|" + JSON.stringify(o || {});
    if (!mats[k]) mats[k] = keep(new T.MeshStandardMaterial(Object.assign({ color: hex, roughness: 0.88, metalness: 0 }, o || {})));
    return mats[k];
  };
  const add = (
    geo: T.BufferGeometry,
    m: T.Material | T.Material[],
    x: number, y: number, z: number,
    parent?: T.Object3D | null,
    noCast?: boolean,
  ) => {
    const me = new T.Mesh(keep(geo), m);
    me.position.set(x, y, z);
    me.castShadow = !noCast;
    me.receiveShadow = true;
    (parent || scene).add(me);
    return me;
  };
  const box = (
    w: number, h: number, dd: number,
    m: T.Material,
    x: number, y: number, z: number,
    parent?: T.Object3D | null,
    noCast?: boolean,
  ) => add(new T.BoxGeometry(w, h, dd), m, x, y, z, parent, noCast);

  const C = {
    cream: 0xf2e6d2, terra: 0xc8643b, terraL: 0xd27a50, stone: 0xb9a68b, frame: 0xfbf7ef, glass: 0x2c4670,
    wood: 0x7a4a2e, metal: 0x2a2d33, grass: 0x8db066, soil: 0x8a5b3b, path: 0xd9cfbe, leaf1: 0x5f9150,
    leaf2: 0x4e8043, trunk: 0x7a5232, tank: 0x1c1c1f, alu: 0xc9ced6,
  };

  // Ground and paths
  const ground = new T.Mesh(keep(new T.CylinderGeometry(10.6, 10.1, 1.2, 72)), [
    mat(C.soil, { roughness: 1 }), mat(C.grass, { roughness: 1 }), mat(C.soil, { roughness: 1 }),
  ]);
  ground.position.y = -0.6;
  ground.receiveShadow = true;
  scene.add(ground);
  box(1.8, 0.04, 4.1, mat(C.path), 0, 0.02, 5.55, null, true);
  box(3.0, 0.04, 4.4, mat(C.path), -3.0, 0.02, 5.4, null, true);

  // The house
  const H = new T.Group();
  scene.add(H);
  const walls = mat(C.cream);
  const terra = mat(C.terra);
  const frameM = mat(C.frame);
  const glassM = mat(C.glass, { roughness: 0.12, metalness: 0.4 });
  const woodM = mat(C.wood);
  const railM = mat(C.metal, { roughness: 0.5, metalness: 0.4 });

  box(8.3, 0.4, 7.3, mat(C.stone), 0, 0.2, 0, H);
  box(8, 2.8, 7, walls, 0, 1.8, 0, H);
  box(8.4, 0.25, 7.4, terra, 0, 3.325, 0, H);
  box(8, 2.8, 7, walls, 0, 4.85, 0, H);
  box(8.4, 0.25, 7.4, terra, 0, 6.375, 0, H);
  box(8.4, 0.8, 0.18, walls, 0, 6.9, 3.61, H);
  box(8.4, 0.8, 0.18, walls, 0, 6.9, -3.61, H);
  box(0.18, 0.8, 7.04, walls, -4.11, 6.9, 0, H);
  box(0.18, 0.8, 7.04, walls, 4.11, 6.9, 0, H);
  box(8.5, 0.08, 0.26, terra, 0, 7.34, 3.61, H);
  box(8.5, 0.08, 0.26, terra, 0, 7.34, -3.61, H);
  box(0.26, 0.08, 7.0, terra, -4.11, 7.34, 0, H);
  box(0.26, 0.08, 7.0, terra, 4.11, 7.34, 0, H);

  // Stair room and water tank on the roof
  box(2.4, 2.5, 2.4, mat(C.terraL), -2.82, 7.75, -2.32, H);
  box(2.75, 0.18, 2.75, mat(0xe3d3b8), -2.82, 9.09, -2.32, H);
  box(0.06, 1.9, 0.95, woodM, -1.59, 7.45, -2.32, H);
  add(new T.CylinderGeometry(0.72, 0.72, 1.3, 28), mat(C.tank, { roughness: 0.55 }), -2.82, 9.83, -2.32, H);
  add(new T.CylinderGeometry(0.28, 0.28, 0.14, 20), mat(C.tank, { roughness: 0.55 }), -2.82, 10.55, -2.32, H);
  [9.45, 9.83, 10.2].forEach((yy) => {
    add(new T.CylinderGeometry(0.735, 0.735, 0.05, 28), mat(0x2b2b30, { roughness: 0.5 }), -2.82, yy, -2.32, H, true);
  });

  // Windows
  const winFront = (x: number, y: number, w: number, h: number) => {
    box(w + 0.18, h + 0.18, 0.08, frameM, x, y, 3.54, H);
    box(w, h, 0.06, glassM, x, y, 3.58, H, true);
    box(0.06, h, 0.08, frameM, x, y, 3.6, H, true);
    box(w + 0.6, 0.08, 0.55, terra, x, y + h / 2 + 0.28, 3.77, H);
  };
  winFront(-2.5, 1.85, 1.4, 1.35);
  winFront(2.5, 1.85, 1.4, 1.35);
  winFront(-2.6, 4.9, 1.3, 1.3);
  winFront(2.6, 4.9, 1.3, 1.3);
  const winSide = (sx: number, z: number, y: number, w: number, h: number) => {
    const o = sx > 0 ? 1 : -1;
    box(0.08, h + 0.18, w + 0.18, frameM, o * 4.04, y, z, H);
    box(0.06, h, w, glassM, o * 4.08, y, z, H, true);
    box(0.55, 0.08, w + 0.6, terra, o * 4.27, y + h / 2 + 0.28, z, H);
  };
  winSide(1, -1.2, 1.85, 1.3, 1.3);
  winSide(1, -1.2, 4.9, 1.3, 1.3);
  winSide(-1, 0.6, 1.85, 1.3, 1.3);
  winSide(-1, 0.6, 4.9, 1.3, 1.3);

  // Front door, steps, balcony and railing
  box(1.45, 2.45, 0.06, frameM, 0, 1.62, 3.52, H);
  box(1.25, 2.3, 0.08, woodM, 0, 1.55, 3.55, H);
  box(2.0, 0.2, 0.6, mat(C.stone), 0, 0.1, 3.95, H);
  box(2.0, 0.2, 0.35, mat(C.stone), 0, 0.3, 3.72, H);
  box(1.38, 2.25, 0.08, frameM, 0, 4.57, 3.54, H);
  box(1.2, 2.1, 0.06, glassM, 0, 4.52, 3.58, H, true);
  box(3.4, 0.25, 1.0, terra, 0, 3.325, 4.2, H);
  for (let i = 0; i <= 8; i++) box(0.05, 1.0, 0.05, railM, -1.65 + i * (3.3 / 8), 3.95, 4.62, H, true);
  box(3.4, 0.07, 0.07, railM, 0, 4.47, 4.62, H);
  box(0.07, 0.07, 0.95, railM, -1.67, 4.47, 4.17, H);
  box(0.07, 0.07, 0.95, railM, 1.67, 4.47, 4.17, H);

  // Down pipe, inverter and net meter on the side wall
  box(0.06, 4.5, 0.06, mat(0x9aa0a8), 4.25, 4.35, 2.0, H, true);
  box(0.16, 0.75, 0.55, mat(0xdfe5ec, { roughness: 0.5 }), 4.09, 1.75, 2.0, H);
  box(0.14, 0.5, 0.36, mat(0xf4f4f0, { roughness: 0.5 }), 4.08, 1.75, 2.8, H);
  const led = new T.Mesh(keep(new T.BoxGeometry(0.03, 0.06, 0.06)), keep(new T.MeshBasicMaterial({ color: 0x5dff9a })));
  led.position.set(4.18, 1.98, 2.18);
  H.add(led);
  const disp = new T.Mesh(keep(new T.BoxGeometry(0.02, 0.12, 0.2)), keep(new T.MeshBasicMaterial({ color: 0x2b4466 })));
  disp.position.set(4.16, 1.86, 2.8);
  H.add(disp);

  // Boundary walls and gate posts
  [-1, 1].forEach((sx) => {
    box(5.2, 0.9, 0.22, walls, sx * 4.0, 0.45, 7.6);
    box(5.3, 0.08, 0.3, terra, sx * 4.0, 0.94, 7.6);
    box(0.5, 1.3, 0.5, mat(C.terraL), sx * 1.4, 0.65, 7.6);
    box(0.6, 0.1, 0.6, terra, sx * 1.4, 1.35, 7.6);
    box(0.22, 0.9, 14.1, walls, sx * 6.6, 0.45, 0.55);
    box(0.3, 0.08, 14.2, terra, sx * 6.6, 0.94, 0.55);
  });
  box(13.4, 0.9, 0.22, walls, 0, 0.45, -6.5);
  box(13.5, 0.08, 0.3, terra, 0, 0.94, -6.5);

  // Car and EV charger
  const car = new T.Group();
  car.position.set(-3.0, 0, 5.5);
  scene.add(car);
  box(1.75, 0.55, 3.7, mat(0xf3f1ec, { roughness: 0.35, metalness: 0.25 }), 0, 0.62, 0, car);
  box(1.55, 0.5, 2.0, mat(0x24324a, { roughness: 0.15, metalness: 0.4 }), 0, 1.13, -0.15, car);
  const wheelG = keep(new T.CylinderGeometry(0.34, 0.34, 0.26, 18));
  const tyreM = mat(0x1b1b1d, { roughness: 0.8 });
  [[-0.86, 1.15], [0.86, 1.15], [-0.86, -1.2], [0.86, -1.2]].forEach((w) => {
    const wm = new T.Mesh(wheelG, tyreM);
    wm.rotation.z = Math.PI / 2;
    wm.position.set(w[0], 0.34, w[1]);
    wm.castShadow = true;
    car.add(wm);
  });
  const lampM = keep(new T.MeshBasicMaterial({ color: 0xfff2c4 }));
  const lampG = keep(new T.BoxGeometry(0.32, 0.12, 0.04));
  [-0.55, 0.55].forEach((lx) => {
    const lm = new T.Mesh(lampG, lampM);
    lm.position.set(lx, 0.7, 1.86);
    car.add(lm);
  });
  box(0.12, 1.1, 0.12, mat(0x8e959e), -4.7, 0.55, 7.25);
  box(0.4, 0.5, 0.2, mat(0xf7f7f4, { roughness: 0.4 }), -4.7, 1.25, 7.22);
  const evLed = new T.Mesh(keep(new T.BoxGeometry(0.16, 0.05, 0.02)), keep(new T.MeshBasicMaterial({ color: 0x58b7ff })));
  evLed.position.set(-4.7, 1.38, 7.11);
  scene.add(evLed);

  // Electricity pole and the service wire to the house
  const poleM = mat(0x6b6f76, { roughness: 0.7 });
  add(new T.CylinderGeometry(0.12, 0.16, 8, 12), poleM, 7.9, 4.0, 4.6);
  box(1.8, 0.12, 0.12, poleM, 7.9, 7.5, 4.6);
  [-0.7, 0.7].forEach((ix) => {
    add(new T.CylinderGeometry(0.06, 0.06, 0.22, 10), mat(0xd9dde3, { roughness: 0.4 }), 7.9 + ix, 7.67, 4.6, null, true);
  });
  const wire = new T.CatmullRomCurve3([new T.Vector3(7.9, 7.35, 4.6), new T.Vector3(6.0, 6.35, 3.5), new T.Vector3(4.2, 5.9, 2.6)]);
  add(new T.TubeGeometry(wire, 24, 0.025, 6, false), mat(0x222428), 0, 0, 0, null, true);

  // Trees and bushes
  const tree = (x: number, z: number, s: number) => {
    add(new T.CylinderGeometry(0.14 * s, 0.22 * s, 1.8 * s, 8), mat(C.trunk), x, 0.9 * s, z);
    const c1 = add(new T.IcosahedronGeometry(1.35 * s, 0), mat(C.leaf1, { flatShading: true }), x, 2.5 * s, z);
    const c2 = add(new T.IcosahedronGeometry(0.95 * s, 0), mat(C.leaf2, { flatShading: true }), x + 0.5 * s, 3.3 * s, z - 0.3 * s);
    c1.rotation.set(0.3, 0.6, 0);
    c2.rotation.set(0.5, 0.2, 0.3);
  };
  tree(-8.1, 2.6, 1.15);
  tree(-7.4, -5.0, 0.95);
  tree(5.2, -5.0, 1.05);
  tree(8.4, -1.6, 0.8);
  const bushM = mat(C.leaf2, { flatShading: true });
  [2.4, 3.6, 4.8, 6.0].forEach((bx) => {
    add(new T.IcosahedronGeometry(0.42, 0), bushM, bx, 0.35, 7.05);
  });

  // Clouds
  const cloudGeo = keep(new T.IcosahedronGeometry(1, 1));
  const cloudM = mat(0xffffff, { roughness: 1, flatShading: true, emissive: 0x3a3a46 });
  const mkCloud = (x: number, y: number, z: number, s: number) => {
    const g = new T.Group();
    [[0, 0, 0, 1.0], [1.1, 0.15, 0.1, 0.8], [-1.0, -0.05, 0, 0.75], [0.4, 0.5, -0.2, 0.7]].forEach((q) => {
      const m = new T.Mesh(cloudGeo, cloudM);
      m.position.set(q[0] * s, q[1] * s, q[2] * s);
      m.scale.setScalar(q[3] * s);
      g.add(m);
    });
    g.position.set(x, y, z);
    scene.add(g);
    return g;
  };
  const clouds = [mkCloud(-9, 12.5, -8, 1.3), mkCloud(10, 13.5, -11, 1.6)];

  // Solar panels: a drawn cell texture on tilted aluminium frames
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 512;
  const g2 = cv.getContext("2d")!;
  const bg = g2.createLinearGradient(0, 0, 256, 512);
  bg.addColorStop(0, "#1d4296");
  bg.addColorStop(1, "#0b1d4d");
  g2.fillStyle = bg;
  g2.fillRect(0, 0, 256, 512);
  g2.strokeStyle = "rgba(170,198,255,0.38)";
  g2.lineWidth = 2;
  for (let i = 1; i < 6; i++) {
    const x = (i * 256) / 6;
    g2.beginPath();
    g2.moveTo(x, 0);
    g2.lineTo(x, 512);
    g2.stroke();
  }
  for (let j = 1; j < 12; j++) {
    const y = (j * 512) / 12;
    g2.beginPath();
    g2.moveTo(0, y);
    g2.lineTo(256, y);
    g2.stroke();
  }
  g2.strokeStyle = "rgba(210,225,255,0.18)";
  g2.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    for (let b = 1; b <= 2; b++) {
      const x = (i * 256) / 6 + (b * 256) / 18;
      g2.beginPath();
      g2.moveTo(x, 0);
      g2.lineTo(x, 512);
      g2.stroke();
    }
  }
  const sheen = g2.createLinearGradient(0, 0, 256, 300);
  sheen.addColorStop(0, "rgba(255,255,255,0.16)");
  sheen.addColorStop(0.55, "rgba(255,255,255,0)");
  g2.fillStyle = sheen;
  g2.fillRect(0, 0, 256, 512);
  const cellTex = keep(new T.CanvasTexture(cv));
  cellTex.encoding = T.sRGBEncoding;
  cellTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const cellM = keep(new T.MeshStandardMaterial({ map: cellTex, roughness: 0.2, metalness: 0.35 }));
  const aluM = mat(C.alu, { roughness: 0.35, metalness: 0.8 });
  const legM = mat(0x8e959e, { roughness: 0.5, metalness: 0.6 });
  const frameGeo = keep(new T.BoxGeometry(0.96, 0.05, 1.9));
  const cellGeo = keep(new T.PlaneGeometry(0.9, 1.84));
  const legFGeo = keep(new T.BoxGeometry(0.05, 0.65, 0.05));
  const legBGeo = keep(new T.BoxGeometry(0.05, 1.2, 0.05));

  interface Panel { root: T.Group; on: boolean; t: number; delay: number; x: number; z: number; tx: number; tz: number }
  const panels: Panel[] = [];
  for (let i = 0; i < MAX_SCENE_PANELS; i++) {
    const root = new T.Group();
    root.visible = false;
    scene.add(root);
    const lf = new T.Mesh(legFGeo, legM);
    lf.position.set(0, 0.325, 0.75);
    lf.castShadow = true;
    root.add(lf);
    const lb = new T.Mesh(legBGeo, legM);
    lb.position.set(0, 0.6, -0.75);
    lb.castShadow = true;
    root.add(lb);
    const tilt = new T.Group();
    tilt.position.set(0, 0.95, 0);
    tilt.rotation.x = 0.35;
    root.add(tilt);
    const fr = new T.Mesh(frameGeo, aluM);
    fr.castShadow = true;
    fr.receiveShadow = true;
    tilt.add(fr);
    const ce = new T.Mesh(cellGeo, cellM);
    ce.rotation.x = -Math.PI / 2;
    ce.position.y = 0.026;
    ce.receiveShadow = true;
    tilt.add(ce);
    panels.push({ root, on: false, t: 0, delay: 0, x: 0, z: 0, tx: 0, tz: 0 });
  }
  let count = -1;
  const setPanels = (n: number) => {
    n = Math.max(0, Math.min(MAX_SCENE_PANELS, n | 0));
    if (n === count) return;
    const slots = panelSlots(n);
    let k = 0;
    panels.forEach((pn, i) => {
      if (i < n) {
        pn.tx = slots[i][0];
        pn.tz = slots[i][1];
        if (!pn.on) {
          pn.on = true;
          if (pn.t <= 0.001) {
            pn.x = pn.tx;
            pn.z = pn.tz;
          }
          pn.delay = (count < 0 ? 0.35 : 0) + k++ * 0.07;
        }
      } else if (pn.on) {
        pn.on = false;
        pn.delay = 0;
      }
    });
    count = n;
    wake();
  };

  // Glowing particles that flow from the panels, through the inverter and meter, to the grid.
  const flow = new T.CatmullRomCurve3(
    [[0.6, 7.9, 0.8], [3.0, 7.5, 1.7], [4.3, 6.4, 2.0], [4.3, 2.3, 2.0], [4.32, 1.75, 2.0], [4.32, 1.75, 2.8], [5.4, 1.2, 3.6], [6.6, 1.15, 4.3], [7.75, 0.6, 4.6], [7.85, 7.2, 4.6]].map(
      (q) => new T.Vector3(q[0], q[1], q[2]),
    ),
    false,
    "catmullrom",
    0.2,
  );
  const NP = 42;
  const pPos = new Float32Array(NP * 3);
  const pGeo = keep(new T.BufferGeometry());
  pGeo.setAttribute("position", new T.BufferAttribute(pPos, 3));
  const pMat = keep(
    new T.PointsMaterial({
      size: 0.42,
      map: keep(glowTex("rgba(255,238,196,1)", "rgba(255,200,90,0)")),
      transparent: true,
      depthWrite: false,
      blending: T.AdditiveBlending,
      color: 0xffd27a,
      opacity: 0,
    }),
  );
  const pts = new T.Points(pGeo, pMat);
  pts.frustumCulled = false;
  scene.add(pts);
  const tmp = new T.Vector3();

  // Camera: orbits the house, drifts gently when idle, follows drags.
  const ctl = { yaw: 0.6, yawT: 0.6, base: 0.6, pitch: 0.34, drag: false, px: 0, py: 0, last: -1e9 };
  const target = new T.Vector3(0, 3.8, 0);
  let dist = 36;
  const place = () => {
    const cp = Math.cos(ctl.pitch);
    camera.position.set(target.x + dist * cp * Math.sin(ctl.yaw), target.y + dist * Math.sin(ctl.pitch), target.z + dist * cp * Math.cos(ctl.yaw));
    camera.lookAt(target);
  };
  const resize = () => {
    const w = Math.max(1, stage.clientWidth);
    const h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    const tv = Math.tan((camera.fov * Math.PI) / 180 / 2);
    dist = Math.max(8.6 / tv, 11.8 / (tv * aspect));
    target.y = 3.8 + (aspect < 1 ? (1 - aspect) * 5 : 0);
  };

  const onDown = (e: PointerEvent) => {
    ctl.drag = true;
    ctl.px = e.clientX;
    ctl.py = e.clientY;
    canvas.style.cursor = "grabbing";
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* the pointer may already be gone */
    }
    wake();
  };
  const onMove = (e: PointerEvent) => {
    if (!ctl.drag) return;
    const dx = e.clientX - ctl.px;
    const dy = e.clientY - ctl.py;
    ctl.px = e.clientX;
    ctl.py = e.clientY;
    ctl.yawT -= dx * 0.008;
    ctl.pitch = Math.max(0.12, Math.min(0.9, ctl.pitch + dy * 0.004));
    ctl.last = performance.now();
    wake();
  };
  const onUp = () => {
    if (!ctl.drag) return;
    ctl.drag = false;
    canvas.style.cursor = "grab";
    ctl.last = performance.now();
    wake();
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  const nudge = (dv: number) => {
    ctl.yawT += dv;
    ctl.last = performance.now();
    wake();
  };

  // Rest while scrolled out of view or in a background tab; wake when shown again.
  let visible = true;
  const io = new IntersectionObserver(
    (ents) => {
      visible = ents.length ? ents[ents.length - 1].isIntersecting : true;
      wake();
    },
    { threshold: 0.01 },
  );
  io.observe(stage);
  const onVisibility = () => wake();
  document.addEventListener("visibilitychange", onVisibility);
  const ro = new ResizeObserver(() => {
    resize();
    wake();
  });
  ro.observe(stage);

  const backOut = (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  // Converged values snap to their targets, so a resting frame is exactly the final picture.
  const SETTLED = 1e-4;
  let raf = 0;
  let running = false;
  let disposed = false;
  let lastT = 0;
  let time = 0;
  let shadowsDirty = true;
  const frame = (now: number) => {
    const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000));
    lastT = now;
    time += dt;
    const idle = !ctl.drag && now - ctl.last > 3000;
    if (!reduce && idle) {
      const want = ctl.base + 0.42 * Math.sin(time * 0.16);
      ctl.yawT += (want - ctl.yawT) * Math.min(1, dt * 0.8);
    } else {
      ctl.base = ctl.yawT - 0.42 * Math.sin(time * 0.16);
    }
    ctl.yaw += (ctl.yawT - ctl.yaw) * Math.min(1, dt * 6);
    if (Math.abs(ctl.yawT - ctl.yaw) < SETTLED) ctl.yaw = ctl.yawT;
    let lit = 0;
    let panelsMoving = false;
    panels.forEach((pn) => {
      if (pn.delay > 0) {
        pn.delay -= dt;
        panelsMoving = true;
        return;
      }
      const [t0, x0, z0] = [pn.t, pn.x, pn.z];
      if (reduce) pn.t = pn.on ? 1 : 0;
      else pn.t = Math.max(0, Math.min(1, pn.t + (pn.on ? dt / 0.5 : -dt / 0.3)));
      const kk = Math.min(1, dt * 9);
      pn.x += (pn.tx - pn.x) * kk;
      pn.z += (pn.tz - pn.z) * kk;
      if (Math.abs(pn.tx - pn.x) < SETTLED) pn.x = pn.tx;
      if (Math.abs(pn.tz - pn.z) < SETTLED) pn.z = pn.tz;
      const e = pn.on ? backOut(pn.t) : pn.t * pn.t;
      pn.root.visible = pn.t > 0.001;
      pn.root.position.set(pn.x, ROOF + (1 - pn.t) * 1.6, pn.z);
      pn.root.scale.setScalar(Math.max(0.001, e));
      if (pn.t !== t0 || pn.x !== x0 || pn.z !== z0) panelsMoving = true;
      if (pn.on && pn.t > 0.5) lit += 1;
    });
    if (panelsMoving) shadowsDirty = true;
    const glow = lit > 0 ? 0.95 : 0;
    pMat.opacity += (glow - pMat.opacity) * Math.min(1, dt * 3);
    if (Math.abs(glow - pMat.opacity) < 1e-3) pMat.opacity = glow;
    pts.visible = pMat.opacity > 0.02;
    if (pts.visible) {
      const speed = reduce ? 0 : 0.085;
      for (let i = 0; i < NP; i++) {
        const uu = (((time * speed + i / NP) % 1) + 1) % 1;
        flow.getPointAt(uu, tmp);
        pPos[i * 3] = tmp.x;
        pPos[i * 3 + 1] = tmp.y;
        pPos[i * 3 + 2] = tmp.z;
      }
      pGeo.attributes.position.needsUpdate = true;
    }
    if (!reduce) {
      clouds.forEach((cl, i) => {
        cl.position.x += dt * (0.22 + i * 0.1);
        if (cl.position.x > 17) cl.position.x = -17;
      });
    }
    if (shadowsDirty) {
      renderer.shadowMap.needsUpdate = true;
      shadowsDirty = false;
    }
    place();
    renderer.render(scene, camera);
    // Full motion keeps drawing (the idle drift, clouds and particles never stop). With reduced
    // motion, rest once the camera, panels and glow have settled.
    const moving = !reduce || ctl.drag || panelsMoving || ctl.yaw !== ctl.yawT || pMat.opacity !== glow;
    if (moving && visible && !document.hidden) raf = requestAnimationFrame(frame);
    else running = false;
  };
  /** Start drawing again after a rest. Does nothing while drawing, off screen or in a background tab. */
  function wake() {
    if (running || disposed || !visible || document.hidden) return;
    running = true;
    lastT = performance.now();
    raf = requestAnimationFrame(frame);
  }
  resize();
  place();
  wake();

  const dispose = () => {
    disposed = true;
    running = false;
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    bin.forEach((o) => {
      try {
        o.dispose();
      } catch {
        /* already gone */
      }
    });
    // The 2048×2048 shadow map, which renderer.dispose() leaves behind. (The r128 typings call it
    // a plain RenderTarget; the renderer creates a WebGLRenderTarget.)
    (sun.shadow.map as T.WebGLRenderTarget | null)?.dispose();
    renderer.dispose();
  };
  return { setPanels, nudge, dispose };
}
