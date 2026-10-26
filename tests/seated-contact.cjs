// Geometry/registration regression; not a substitute for live browser visual QA.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname+'/..',c={window:{}};
vm.runInNewContext(fs.readFileSync(root+'/room-assets.js','utf8'),c);
vm.runInNewContext(fs.readFileSync(root+'/seated-leg.js','utf8'),c);
const a=c.window.PLAYROOM_ART;
const inside=(p,poly)=>{let hit=false;for(let i=0,j=poly.length-2;i<poly.length;j=i,i+=2){const x=poly[i],y=poly[i+1],u=poly[j],v=poly[j+1];if((y>p[1])!==(v>p[1])&&p[0]<(u-x)*(p[1]-y)/(v-y)+x)hit=!hit;}return hit;};
const apply=(m,[x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];
assert(inside([400,500],a.characterKeep),'original torso retained');
assert(inside([900,630],a.characterKeep),'original typing hand retained');
assert(inside([560,1200],a.characterKeep),'approved far shoe retained');
assert(!inside([820,1000],a.characterKeep),'old near shin removed');
assert(!inside([800,1350],a.characterKeep),'old near shoe removed');
assert(inside([880,850],a.rightLegBounds),'new shin remains inside its alpha-speck guard');
assert(!inside([800,0],a.rightLegBounds),'off-leg alpha specks cannot darken the upper body/desk');
assert.equal(a.rightLegFront,undefined,'no leg pass can overpaint the arm tip');
const deform=(x,y)=>c.window.SEATED_LEG.deform(x,y,a.rightLegBend);
assert.equal(JSON.stringify(deform(240,330)),JSON.stringify([240,330]),'hip join pinned');
assert.equal(JSON.stringify(deform(1230,1170)),JSON.stringify([1230,1170]),'shoe pinned');
const approvedStem=[786,607,817,608,847,622,863,641,865,663,854,694,835,716,819,726,819,760,810,775,779,780,752,767,752,730,760,708,760,664];
assert.equal(JSON.stringify(a.chairForeground),JSON.stringify([approvedStem]),'approved other-leg stem polygon is unchanged');
assert.equal(JSON.stringify(a.objects.character),JSON.stringify({x:760,y:290,scale:.24}));
assert.equal(JSON.stringify(a.objects.chair),JSON.stringify({x:610,y:331,scale:.34}));
const knee=apply(a.objects.rightleg.matrix,deform(870,350)),toe=apply(a.objects.rightleg.matrix,deform(1230,1170));
const chairFront=[610+1135*.34,331+540*.34],supportRight=610+1097*.34;
for(const width of [320,390,768,1440]){
 const scale=width/a.width;
 assert(knee[0]*scale>chairFront[0]*scale,'knee passes front corner at '+width+'px');
 assert(knee[0]*scale>supportRight*scale,'shin is forward/right of arm support at '+width+'px');
 assert(knee[1]*scale>(.4541*knee[0]+51.95)*scale,'knee is below true desk underside at '+width+'px');
 assert(toe[1]*scale>knee[1]*scale,'shoe is below knee at '+width+'px');
}
for(const ext of ['png','webp'])assert(fs.existsSync(root+'/assets/room/character-right-leg-v1.'+ext));
console.log('PASS: lowered knee beyond cushion and below true desk underside at four scene scales; hip/shoe pinned; original torso/hands/far shoe retained; no distal arm override; exact approved stem preserved. Geometry evidence only.');
