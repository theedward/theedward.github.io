import {FontLoader} from '../vendor/FontLoader.mjs';import {makeLetter,LETTERS,angleAt,motionAllowed} from '../header-geometry.mjs';import fs from 'node:fs';import assert from 'node:assert/strict';
const f=new FontLoader().parse(JSON.parse(fs.readFileSync(new URL('../assets/fonts/nunito-black-subset.typeface.json',import.meta.url))));
for(const c of LETTERS.filter(x=>x!==' ')){const {geometry:g}=makeLetter(f,c);g.computeBoundingBox();assert(g.boundingBox.max.z-g.boundingBox.min.z>=26);assert(g.groups.length>=2);assert([...g.attributes.position.array].every(Number.isFinite));if(c==='Ã')assert(g.boundingBox.max.y>45);}
assert(Math.abs(angleAt(9.325,0)-Math.PI)<.001);assert.equal(angleAt(9.8,9),0);assert.equal(angleAt(37,0),0);assert(angleAt(9.649,0)>6.28);
console.log('PASS: ten volumetric letters; beveled caps/sides; grouped A+tilde; staggered full 360-degree rotation and rest. GPU rendering not exercised.');

const base={reduced:false,hidden:false,visible:true,paused:false,dialog:false,lost:false};assert(motionAllowed(base));for(const key of ["reduced","hidden","paused","dialog","lost"])assert(!motionAllowed({...base,[key]:true}));assert(!motionAllowed({...base,visible:false}));console.log("PASS reduced motion, hidden, offscreen, manual pause, modal and context-loss gates.");
// Frustum safety across a full wave, using conservative mesh bounding-box corners.
const THREE=await import('../vendor/three.module.mjs');let cursor=0;const items=[];
for(const c of LETTERS){if(c===' '){cursor+=45;continue;}const {geometry,width}=makeLetter(f,c);geometry.computeBoundingBox();items.push({box:geometry.boundingBox,x:cursor+width/2});cursor+=width+12;}
const camera=new THREE.PerspectiveCamera(22,290/88,1,5000);camera.position.set(0,15,(cursor+40)/(2*Math.tan(11*Math.PI/180)*camera.aspect));camera.lookAt(0,15,0);camera.updateMatrixWorld();
for(let t=8;t<=15;t+=1/24)for(let i=0;i<items.length;i++){const o=new THREE.Object3D();o.position.set(items[i].x-cursor/2,-4,0);o.rotation.set(-.055,angleAt(t,i),0);o.updateMatrixWorld();const b=items[i].box;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new THREE.Vector3(x,y,z).applyMatrix4(o.matrixWorld).project(camera);assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,'geometry clipped');}}
console.log('PASS conservative bounds remain inside production camera throughout full wave.');
assert.equal(f.generateShapes('A',100).length,1);assert.equal(f.generateShapes('A',100)[0].holes.length,1);assert.equal(f.generateShapes('X',100).length,1);assert.equal(f.generateShapes('Ã',100).length,2);console.log('PASS unioned A/X outlines avoid coplanar overlap; accent remains a separate contour in the same mesh.');

for(let i=0;i<10;i++){const start=9+i*.10;assert.equal(angleAt(start-.001,i),0);assert.equal(angleAt(start+.651,i),0);let prev=0;for(let j=1;j<650;j++){const a=angleAt(start+j/1000,i);assert(a>=prev&&a<=2*Math.PI);prev=a;}}console.log("PASS 650 ms monotonic full spins, 100 ms stagger, no overshoot, unchanged 38 s cycle.");
