/* Local, bounded mesh motion preserves approved sprite silhouettes and contact points. */
window.installPassiveMotion = ({PIXI,app,manifest,named,tracks,canvas}) => {
  const {MeshPlane,Container,Graphics,Matrix}=PIXI;
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const bell=(x,y,cx,cy,rx,ry)=>Math.pow(Math.max(0,1-((x-cx)/rx)**2-((y-cy)/ry)**2),2);
  const mesh=(id,deform)=>{
    const old=named.get(id),parent=old.parent,index=parent.getChildIndex(old);
    if(app.renderer.name==='canvas'){
      // Canvas renderer has no MeshPipe. Render the same local deformation into a
      // small runtime texture using affine triangles; source files remain untouched.
      const source=old.texture.source.resource,w=old.texture.width,h=old.texture.height;
      const scale=manifest.objects[id].scale,canvas2=document.createElement('canvas');
      canvas2.width=Math.ceil(w*scale*1.5);canvas2.height=Math.ceil(h*scale*1.5);
      const ctx=canvas2.getContext('2d'),sx=canvas2.width/w,sy=canvas2.height/h;
      const texture=PIXI.Texture.from(canvas2),replacement=new PIXI.Sprite(texture);
      replacement.position.copyFrom(old.position);replacement.width=w*scale;replacement.height=h*scale;replacement.eventMode='none';replacement.label=id;
      parent.removeChild(old);parent.addChildAt(replacement,index);named.set(id,replacement);
      const nx=16,ny=20;
      function triangle(points,t){
        const a=points[0],b=points[1],c=points[2],dest=points.map(([x,y])=>{const d=deform(x,y,t);return [(x+d[0])*sx,(y+d[1])*sy];});
        const u=b[0]-a[0],v=b[1]-a[1],q=c[0]-a[0],r=c[1]-a[1],det=u*r-v*q;
        const dx=dest[1][0]-dest[0][0],dy=dest[1][1]-dest[0][1],ex=dest[2][0]-dest[0][0],ey=dest[2][1]-dest[0][1];
        const A=(dx*r-ex*v)/det,B=(dy*r-ey*v)/det,C=(ex*u-dx*q)/det,D=(ey*u-dy*q)/det;
        const center=[(dest[0][0]+dest[1][0]+dest[2][0])/3,(dest[0][1]+dest[1][1]+dest[2][1])/3];const clip=dest.map(p=>{const dx=p[0]-center[0],dy=p[1]-center[1],length=Math.hypot(dx,dy);return [p[0]+dx/length*.35,p[1]+dy/length*.35];});ctx.save();ctx.beginPath();ctx.moveTo(...clip[0]);ctx.lineTo(...clip[1]);ctx.lineTo(...clip[2]);ctx.closePath();ctx.clip();ctx.setTransform(A,B,C,D,dest[0][0]-A*a[0]-C*a[1],dest[0][1]-B*a[0]-D*a[1]);ctx.drawImage(source,0,0);ctx.restore();
      }
      let frame=-1;tracks.set(id,t=>{if(Math.floor(t*15)===frame)return;frame=Math.floor(t*15);ctx.clearRect(0,0,canvas2.width,canvas2.height);for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=[x*w/nx,y*h/ny],b=[(x+1)*w/nx,y*h/ny],c=[x*w/nx,(y+1)*h/ny],d=[(x+1)*w/nx,(y+1)*h/ny];triangle([a,b,c],t);triangle([b,d,c],t);}texture.source.update();});
      return;
    }

    const obj=new MeshPlane({texture:old.texture,verticesX:49,verticesY:49});
    obj.setFromMatrix(old.localTransform); // Sprite transform is also set explicitly below.
    const p=manifest.objects[id];if(p.matrix)obj.setFromMatrix(new Matrix(...p.matrix));else{obj.position.set(p.x,p.y);obj.scale.set(p.scale);}
    obj.label=id;obj.eventMode='none';parent.removeChild(old);parent.addChildAt(obj,index);named.set(id,obj);
    const buffer=obj.geometry.getAttribute('aPosition').buffer,base=new Float32Array(buffer.data);
    tracks.set(id,t=>{for(let i=0;i<base.length;i+=2){const x=base[i],y=base[i+1],d=deform(x,y,t);buffer.data[i]=x+d[0];buffer.data[i+1]=y+d[1];}buffer.update();});
  };
  mesh('floorplant',(x,y,t)=>{const w=smooth((810-y)/650);return [w*(9*Math.sin(t*.53)+3*Math.sin(t*.91+x*.009)),w*1.8*Math.sin(t*.7+x*.012)];});
  mesh('plant',(x,y,t)=>{const w=smooth((440-y)/400);return [w*10*Math.sin(t*.6+1.7),w*2*Math.sin(t*.8)];});
  mesh('trailingplant',(x,y,t)=>{const top=smooth((350-y)/300),vine=smooth((x-830)/140)*smooth((y-550)/350);return [(top*8+vine*16)*Math.sin(t*.47+2+y*.003),vine*2*Math.sin(t*.7)];});
  mesh('ahri',(x,y,t)=>{const w=bell(x,y,1060,410,480,380),b=(1-Math.cos(t*2*Math.PI/4.9))/2;return [w*3*b,-w*11*b];});
  mesh('character',(x,y,t)=>{
    // Only hands/wrists and head: feet, torso, chair and desktop never translate.
    const typing=smooth(Math.sin(t*.43)+.3),left=bell(x,y,672,539,120,95),right=bell(x,y,887,622,110,95);
    const phase=t%24,nod=phase>15&&phase<20?Math.sin((phase-15)/5*Math.PI)**2:0;
    const head=smooth((405-y)/105)*smooth((x-220)/75)*smooth((560-x)/70);
    return [head*3*nod,typing*(left*3.4*Math.sin(t*12)+right*3*Math.sin(t*14+1))-head*4*nod];
  });
  const cloud=named.get('clouds'),cloudPose=manifest.objects.clouds.matrix;
  tracks.set('clouds',t=>{const drift=24*Math.sin(t*2*Math.PI/100);cloud.x=cloudPose[4]+drift;cloud.y=cloudPose[5]-drift*.443;});
  // Screen content is a purpose-built code UI, not replacement artwork. Frames stay untouched.
  const furniture=named.get('furniture'),monitor=named.get('monitors'),screens=new Container({label:'monitor-content'});
  furniture.addChildAt(screens,furniture.getChildIndex(monitor)+1);
  const pose=manifest.objects.monitors;
  const panel=(x,y)=>{const c=new Container();c.setFromMatrix(new Matrix(pose.scale,.395*pose.scale,0,pose.scale,pose.x+x*pose.scale,pose.y+y*pose.scale));screens.addChild(c);return c;};
  const left=panel(164,103),right=panel(794,347),code=new Graphics(),preview=new Graphics();left.addChild(code);right.addChild(preview);
  let last=-1, screenOffset=0, screenTime=0;
  const api=window.playroom;
  if(api) api.cycleScreen=()=>{screenOffset=(screenOffset+1)%3;last=-1;tracks.get('monitor')(screenTime);api.render?.();return Number(canvas.dataset.monitorMode);};
  tracks.set('monitor',t=>{
    screenTime=t;const step=Math.floor(t*2);if(step===last)return;last=step;
    code.clear().rect(0,0,550,320).fill({color:0x102442,alpha:.72});
    code.rect(15,15,520,19).fill({color:0x697d9b,alpha:.3});
    const rows=6+Math.floor(t*.8)%5;
    for(let i=0;i<rows;i++){code.rect(18,52+i*23,12,5).fill(0x526078);code.rect(50+(i%3)*16,52+i*23,90+(i*67)%260,5).fill({color:[0x83bdb2,0xb0a0cc,0xcbab78][i%3],alpha:.7});}
    code.rect(50,285,12+((step%16)*22),5).fill({color:0x91b59a,alpha:.75});
    preview.clear().rect(0,0,550,320).fill({color:0x12203d,alpha:.76});
    // Calm pixel landscape/build preview alternates every 18 seconds.
    const mode=(Math.floor(t/18)%2+screenOffset)%3;
    if(!mode){for(let i=0;i<8;i++)preview.rect(30+i*62,210-((i*31)%90),44,70+((i*31)%90)).fill({color:0x405071,alpha:.8});preview.rect(250+Math.sin(t*.3)*105,85,22,22).fill(0xbaa4c9);}
    else if(mode===1) {preview.rect(70,70,410,160).fill({color:0x263d54,alpha:.8});for(let i=0;i<5;i++)preview.rect(100,100+i*24,90+((i*53+step*3)%240),6).fill({color:0x8aa9aa,alpha:.65});}
    else {for(let y=0;y<5;y++)for(let x=0;x<5;x++)preview.rect(140+x*45,40+y*45,35,35).fill({color:(x+y)%3===0?0xa79abd:0x537b85,alpha:.8});}
    canvas.dataset.monitorMode=String(mode);
  });
  tracks.forEach(update=>update(0));
};
