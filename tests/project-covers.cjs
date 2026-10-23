const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../project-covers.js','utf8');
async function fixture(fail=''){
 let serial=0,transforms=0;
 class Image {constructor(){this.naturalWidth=600;this.naturalHeight=900;}set src(v){this.url=v;queueMicrotask(()=>v.includes(fail)&&fail?this.onerror():this.onload());}}
 const context={save(){},restore(){},beginPath(){},closePath(){},clip(){},moveTo(){},lineTo(){},drawImage(){},setTransform(...v){assert(v.every(Number.isFinite));transforms++;}};
 const c={window:{},Image,document:{createElement(){const id=++serial;return{getContext:()=>context,toDataURL:()=>`data:image/png;base64,cover${id}`};}}};vm.runInNewContext(source,c);await c.window.PROJECT_COVERS.ready;return{api:c.window.PROJECT_COVERS,transforms};
}
(async()=>{const {api,transforms}=await fixture();assert.equal(transforms,4*8*8*2);assert.equal(new Set([0,1,2,3].map(api.source)).size,4);for(let i=0;i<4;i++){assert(api.projected(i));assert(fs.existsSync(__dirname+'/../'+api.flat(i)));}
 const {api:partial}=await fixture('heimdall');assert(!partial.projected(1));assert.equal(partial.source(1),'assets/covers/heimdall.png');assert(partial.projected(0));
 const {api:noShell}=await fixture('case1');assert.equal(noShell.source(3),'assets/covers/pokelens-3ds.png');
 const html=fs.readFileSync(__dirname+'/../index.html','utf8'),app=fs.readFileSync(__dirname+'/../app.js','utf8'),flight=fs.readFileSync(__dirname+'/../case-transition.js','utf8');assert(html.includes('project-covers.js'));assert(app.includes('PROJECT_COVERS.flat(index)'));assert(flight.includes('covers.source(s.index)'));assert(!flight.includes('href="assets/room/case1'));
 console.log('PASS four distinct approved sources, finite perspective grid, per-cover and shell failure fallback, project-indexed details/flights; Canvas mock evidence.');
})();
