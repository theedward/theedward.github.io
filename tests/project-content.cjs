const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const c={};vm.runInNewContext(source.slice(source.indexOf('const PROJECTS ='),source.indexOf('\nconst $'))+'\nthis.projects=PROJECTS',c);
assert.deepEqual(Array.from(c.projects,p=>p.title),['Voltorb Lab','Heimdall','Argus VLC SDK','PokéLens 3DS']);
assert.deepEqual(Array.from(c.projects,p=>p.url),['https://github.com/theedward/voltorb-flip','https://github.com/theedward/heimdall','https://github.com/theedward/argus-vlc-sdk',undefined]);
assert.match(c.projects[2].description,/not the Argus app/);assert.match(c.projects[2].note,/not App Store approval/);assert.match(html,/Open Heimdall project/);assert.match(html,/Open Argus VLC SDK project/);assert.match(html,/collection-dialog/);assert(!html.includes('class="back-catalogue"'));assert.match(html,/PokéLens 3DS/);assert.match(c.projects[3].note,/Omega Ruby \(USA, Rev 2\)/);assert.match(c.projects[3].note,/Usable development build/);assert(!/href=["'][^"']*pokelens/i.test(html));
console.log('PASS: featured selection, exact verified repository destinations, SDK-vs-app scope, accessible case labels, native collection dialog, no invented Pokelens public link.');
