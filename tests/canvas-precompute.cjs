const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=require('node:path').join(__dirname,'..');
class Vec{set(x,y=x){this.x=x;this.y=y;}copyFrom(p){this.x=p.x;this.y=p.y;}}
class Container{constructor(o={}){Object.assign(this,o);this.children=[];this.position=new Vec();this.scale=new Vec();}addChild(c){c.parent=this;this.children.push(c);return c;}addChildAt(c,i){c.parent=this;this.children.splice(i,0,c);}removeChild(c){this.children.splice(this.children.indexOf(c),1);}getChildIndex(c){return this.children.indexOf(c);}setFromMatrix(){}}
class Sprite extends Container{constructor(texture){super();this.texture=texture;}}
class Graphics extends Container{clear(){return this;}rect(){return this;}fill(){return this;}}
class Matrix{}
function run(source){
 let calls=[],surfaces=[];const sizes={floorplant:[1237,1272],plant:[1536,1024],trailingplant:[1312,1199],ahri:[1536,1024],character:[1024,1536],clouds:[1536,1024],monitors:[1536,1024]};
 const c={window:{},document:{createElement(){const canvas={width:0,height:0,getContext(){return new Proxy({}, {get:(_,name)=>(...args)=>calls.push([surfaces.indexOf(canvas),name,...(name==='drawImage'?['source',...args.slice(1)]:args)])});}};surfaces.push(canvas);return canvas;}}};vm.createContext(c);vm.runInContext(fs.readFileSync(root+'/room-assets.js','utf8'),c);vm.runInContext(source,c);
 const manifest=c.window.PLAYROOM_ART,named=new Map(),tracks=new Map(),furniture=new Container();named.set('furniture',furniture);
 for(const [id,[width,height]]of Object.entries(sizes)){const s=new Sprite({width,height,source:{resource:{}}});furniture.addChild(s);named.set(id,s);}
 c.window.installPassiveMotion({PIXI:{Container,Graphics,Matrix,Sprite,Texture:{from:()=>({source:{update(){}}})}},app:{renderer:{name:'canvas'}},manifest,named,tracks,canvas:{dataset:{}}});
 const hashes=[];for(const t of [0,1,2.45,17.5,100]){calls=[];for(const id of ['floorplant','plant','trailingplant','ahri','character'])tracks.get(id)(t);hashes.push(crypto.createHash('sha256').update(JSON.stringify(calls)).digest('hex'));}return hashes;
}
// Frozen operation traces from the previous renderer at the same timestamps.
const expected=['4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945','172735248b031fc3f64263502541cb77dae699b1ab85f9c65217a766394dd47a','79d43aa7723347b3bb01a715658fa291fda3f4bc3304795e3a565699579dcd8a','50671408cbfd74a37ac07280952124a2b8e65a65ededbc2197395b1aa6462b76','4a8ec53f585778b81cf80507d190f21666afa0e0a405b8aa9ec9999e8dc79fe4'];
assert.deepEqual(run(fs.readFileSync(root+'/passive-motion.js','utf8')),expected);
console.log('PASS: Canvas operation/geometry traces unchanged after vertex precomputation at sampled times. Mock Canvas, not pixel screenshot evidence.');
