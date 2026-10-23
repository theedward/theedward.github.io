import * as THREE from './vendor/three.module.mjs';
import {FontLoader} from './vendor/FontLoader.mjs';
import {LETTERS,makeLetter,angleAt,motionAllowed} from './header-geometry.mjs';
const host=document.querySelector('#name-art');
const media=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,raf=0,last=0,time=0,visible=true,lost=false,groups=[];
function allowed(){return motionAllowed({reduced:media.matches,hidden:document.hidden,visible,paused:document.documentElement.classList.contains('no-motion'),dialog:!!document.querySelector('dialog[open]'),lost});}
try{
  // Keep the approved static artwork visible until one full GPU frame succeeds.
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(22,4,1,5000);
  const font=new FontLoader().parse(await (await fetch('assets/fonts/nunito-black-subset.typeface.json')).json());
  const white=new THREE.MeshPhysicalMaterial({color:0xfff8e9,roughness:.3,metalness:.03,clearcoat:.35,clearcoatRoughness:.3});
  const orange=new THREE.MeshPhysicalMaterial({color:0xf07824,roughness:.3,metalness:.07,clearcoat:.25});
  const letters=new THREE.Group();scene.add(letters);let cursor=0;
  for(const letter of LETTERS){if(letter===' '){cursor+=45;continue;}
    const {geometry,width}=makeLetter(font,letter),group=new THREE.Group();
    group.add(new THREE.Mesh(geometry,[white,orange]));group.position.x=cursor+width/2;group.rotation.x=-.055;
    letters.add(group);groups.push(group);cursor+=width+12;
  }
  letters.position.x=-cursor/2;letters.position.y=-4;
  scene.add(new THREE.HemisphereLight(0xffffff,0x503019,2.3));
  const key=new THREE.DirectionalLight(0xffffff,3.5);key.position.set(-300,450,800);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffb55b,1.2);rim.position.set(400,50,-250);scene.add(rim);
  const paint=()=>renderer.render(scene,camera);
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.set(0,15,(cursor+40)/(2*Math.tan(11*Math.PI/180)*camera.aspect));camera.lookAt(0,15,0);camera.updateProjectionMatrix();paint();}
  host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');resize();
  host.dataset.renderer='webgl';host.classList.add('gpu-ready');
  function frame(now){raf=0;if(!allowed()){last=0;return;}if(last)time+=Math.min((now-last)/1000,.1);last=now;
    groups.forEach((g,i)=>g.rotation.y=angleAt(time,i));paint();raf=requestAnimationFrame(frame);}
  function sync(){cancelAnimationFrame(raf);raf=0;last=0;if(!allowed()){time=0;groups.forEach(g=>g.rotation.y=0);paint();}else raf=requestAnimationFrame(frame);}
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();}).observe(host);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);host.classList.remove('gpu-ready');host.dataset.renderer='static-context-lost';});
  sync();
}catch(error){renderer?.dispose();host.dataset.renderer='static-fallback';host.querySelector('canvas')?.remove();}
