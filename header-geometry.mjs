import * as THREE from './vendor/three.module.mjs';
export const LETTERS=[...'JOÃO SEIXAS'];
export function angleAt(seconds,index){
  const t=(seconds%38)-9-index*.10;
  if(t<=0||t>=.65)return 0;
  const u=t/.65;
  return 2*Math.PI*(u*u*u*(u*(u*6-15)+10));
}
export function makeLetter(font,letter){
  // The accented glyph supplies both contours, so Ã and its tilde share one mesh.
  const shapes=font.generateShapes(letter,100);
  const geometry=new THREE.ExtrudeGeometry(shapes,{depth:18,steps:1,bevelEnabled:true,bevelThickness:5,bevelSize:1.2,bevelSegments:6,curveSegments:20});
  geometry.computeBoundingBox();
  const b=geometry.boundingBox, width=b.max.x-b.min.x;
  geometry.translate(-(b.max.x+b.min.x)/2,-40,-9);
  return {geometry,width};
}

export const motionAllowed=({reduced,hidden,visible,paused,dialog,lost})=>!reduced&&!hidden&&visible&&!paused&&!dialog&&!lost;
