// Renderer click APIs tested with the same deterministic scene doubles as ambient QA.
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/ambient-events.cjs','utf8')+`
const click=fixture();click.c.window.playroom.state={paused:false};
click.tracks.get('yawn')(5);assert.equal(click.c.window.playroom.petCat(),true);
assert.equal(click.c.window.playroom.petCat(),false,'repeat coalesced');
click.tracks.get('yawn')(6.5);assert.equal(click.canvas.dataset.yawn,'yawning');
click.tracks.get('yawn')(9.7);assert.equal(click.canvas.dataset.yawn,'sleeping');
click.c.window.playroom.state.paused=true;assert.equal(click.c.window.playroom.petCat(),false);assert.equal(click.c.window.playroom.dipLamp(),false);
click.c.window.playroom.state.paused=false;assert.equal(click.c.window.playroom.dipLamp(),true);assert.equal(click.c.window.playroom.dipLamp(),false);
click.tracks.get('lamp-dip')(11.1);near(click.shade.alpha,.3);click.tracks.get('lamp-dip')(12.6);near(click.shade.alpha,0);
console.log('PASS: click yawn actual frames/restore, repeated-click cooldown, paused suppression; click lamp bounded dim/restore.');
`;
vm.runInNewContext(source,{require,__dirname,console,URLSearchParams});
const passive=fs.readFileSync(__dirname+'/passive-motion.cjs','utf8').split('const appSource=')[0].replace('const ctx={window:{}}','const ctx={window:{playroom:{render(){this.renders=(this.renders||0)+1;}}}}')+`
tracks.get('monitor')(40);
assert.equal(ctx.window.playroom.cycleScreen(),1);
assert.equal(ctx.window.playroom.cycleScreen(),2);
assert.equal(ctx.window.playroom.cycleScreen(),0);
assert.equal(ctx.window.playroom.renders,3,'click redraws even without running ticker');
console.log('PASS: three manual monitor modes with immediate redraw.');
`;
vm.runInNewContext(passive,{require,__dirname,console,URLSearchParams});
const room=fs.readFileSync(__dirname+'/../room.js','utf8');
const ballBlock=room.slice(room.indexOf('    // One locally bounded kick.'),room.indexOf('    app.ticker.maxFPS=30;'));
vm.runInNewContext(`
const assert=require('node:assert/strict'),state={paused:false},api={},canvas={dataset:{}},animationTracks=new Map(),manifest={objects:{football:{x:1050,y:776}}},ball={x:1050,y:776},named=new Map([['football',ball]]);let time=0;
${ballBlock}
assert.equal(api.bounceBall(),true);assert.equal(api.bounceBall(),false);
animationTracks.get('football-click')(.6);assert.equal(ball.y,764);
animationTracks.get('football-click')(1.2);assert.equal(ball.y,776);assert.equal(ball.x,1050);
time=2;state.paused=true;assert.equal(api.bounceBall(),false);
console.log('PASS: ball bounded 12px lift, exact return, repeat cooldown and paused suppression.');
`,{require,console});
