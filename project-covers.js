/* Approved original cover art. Runtime projection preserves the existing case shell/camera. */
window.PROJECT_COVERS=(()=>{
  const slugs=['voltorb-lab','heimdall','argus-vlc-sdk','pokelens-3ds'];
  const flat=i=>`assets/covers/${slugs[i]||slugs[0]}.png`;
  const canvases=[],urls=[];
  const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});
  const api={flat,canvas:i=>canvases[i],source:i=>urls[i]||flat(i),projected:i=>!!canvases[i],ready:null};
  function project(shell,cover){
    const c=document.createElement('canvas');c.width=1536;c.height=1024;const ctx=c.getContext('2d');ctx.drawImage(shell,0,0);
    const q=[[460,118],[1020,287],[1020,927],[460,711]],w=cover.naturalWidth,h=cover.naturalHeight;
    const point=(u,v)=>[(1-v)*((1-u)*q[0][0]+u*q[1][0])+v*((1-u)*q[3][0]+u*q[2][0]),(1-v)*((1-u)*q[0][1]+u*q[1][1])+v*((1-u)*q[3][1]+u*q[2][1])];
    ctx.save();ctx.beginPath();q.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();
    function tri(s,d){const [a,b,c]=s,[p,r,t]=d,ux=b[0]-a[0],uy=b[1]-a[1],vx=c[0]-a[0],vy=c[1]-a[1],det=ux*vy-uy*vx;
      const A=((r[0]-p[0])*vy-(t[0]-p[0])*uy)/det,B=((r[1]-p[1])*vy-(t[1]-p[1])*uy)/det,C=((t[0]-p[0])*ux-(r[0]-p[0])*vx)/det,D=((t[1]-p[1])*ux-(r[1]-p[1])*vx)/det;
      const center=[(p[0]+r[0]+t[0])/3,(p[1]+r[1]+t[1])/3];ctx.save();ctx.beginPath();d.forEach((v,i)=>{const dx=v[0]-center[0],dy=v[1]-center[1],n=Math.hypot(dx,dy),x=v[0]+dx/n*.7,y=v[1]+dy/n*.7;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.clip();ctx.setTransform(A,B,C,D,p[0]-A*a[0]-C*a[1],p[1]-B*a[0]-D*a[1]);ctx.drawImage(cover,0,0);ctx.restore();}
    const n=8;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const uv=[[x/n,y/n],[(x+1)/n,y/n],[(x+1)/n,(y+1)/n],[x/n,(y+1)/n]],s=uv.map(([u,v])=>[u*w,v*h]),d=uv.map(([u,v])=>point(u,v));tri([s[0],s[1],s[2]],[d[0],d[1],d[2]]);tri([s[0],s[2],s[3]],[d[0],d[2],d[3]]);}ctx.restore();return c;
  }
  api.ready=(async()=>{let shell;try{shell=await image('assets/room/case1.webp');}catch{try{shell=await image('assets/room/case1.png');}catch{return;}}
    await Promise.all(slugs.map(async(_,i)=>{try{const cover=await image(flat(i));canvases[i]=project(shell,cover);urls[i]=canvases[i].toDataURL('image/png');}catch{/* Flat original remains available without switching to unrelated artwork. */}}));
  })();return api;
})();
