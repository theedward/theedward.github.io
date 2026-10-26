// Both static mesh implementations, without a GPU/browser requirement.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname+'/..',calls=[],surfaces=[];
const context=new Proxy({}, {get:(_,name)=>(...args)=>{if(name==='setTransform')assert(args.every(Number.isFinite));calls.push(name);}});
const c={window:{},document:{createElement(){const canvas={width:0,height:0,getContext:()=>context};surfaces.push(canvas);return canvas;}}};
vm.runInNewContext(fs.readFileSync(root+'/room-assets.js','utf8'),c);vm.runInNewContext(fs.readFileSync(root+'/seated-leg.js','utf8'),c);
class Obj{constructor(o={}){this.texture=o.texture;this.children=[];}setFromMatrix(m){this.matrix=m;}addChildAt(o,i){o.parent=this;this.children.splice(i,0,o);}getChildIndex(o){return this.children.indexOf(o);}removeChild(o){this.children.splice(this.children.indexOf(o),1);}}
class Matrix{constructor(...values){this.values=values;}}
class Mesh extends Obj{constructor(o){super(o);const data=[];for(let y=0;y<o.verticesY;y++)for(let x=0;x<o.verticesX;x++)data.push(x*o.texture.width/(o.verticesX-1),y*o.texture.height/(o.verticesY-1));this.buffer={data:new Float32Array(data),updates:0,update(){this.updates++;}};this.geometry={getAttribute:()=>({buffer:this.buffer})};}}
const PIXI={Matrix,Sprite:Obj,MeshPlane:Mesh,Texture:{from:canvas=>({source:{resource:canvas}})}};
for(const renderer of ['webgl','canvas']){
 const parent=new Obj(),before=new Obj(),old=new Obj({texture:{width:1254,height:1254,source:{resource:{}}}}),after=new Obj();
 old.mask={approved:true};parent.addChildAt(before,0);parent.addChildAt(old,1);parent.addChildAt(after,2);const named=new Map([['rightleg',old]]);
 c.window.SEATED_LEG.install({PIXI,app:{renderer:{name:renderer}},manifest:c.window.PLAYROOM_ART,named});
 const replacement=named.get('rightleg');assert.equal(parent.children[1],replacement);assert.equal(replacement.mask,old.mask);assert.equal(replacement.label,'rightleg');assert.equal(replacement.eventMode,'none');
 if(renderer==='webgl'){
  assert.equal(replacement.texture,old.texture);assert.equal(replacement.buffer.updates,1);assert(replacement.buffer.data.every(Number.isFinite));
  assert.equal(JSON.stringify(replacement.matrix.values),JSON.stringify(c.window.PLAYROOM_ART.objects.rightleg.matrix));
 }else{
  assert.equal(calls.filter(x=>x==='drawImage').length,40*40*2);
  assert(surfaces[0].width<220&&surfaces[0].height<220,'Canvas caches a small scene-resolution patch, not a full scene');
  assert.equal(JSON.stringify(replacement.matrix.values.slice(0,4)),JSON.stringify([1,0,0,1]),'no second shear/downsample');
 }
}
assert.doesNotThrow(()=>c.window.SEATED_LEG.install({named:new Map()}),'missing optional leg is a no-op');
const html=fs.readFileSync(root+'/index.html','utf8');assert(html.indexOf('seated-leg.js')<html.indexOf('room.js'));
console.log('PASS: static WebGL mesh and finite 3200-triangle Canvas fallback preserve source, mask, layer index and anchors; fallback rasterizes once at scene resolution; missing leg safe; script dependency ordered.');
