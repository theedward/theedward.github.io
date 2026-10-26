/* Static geometry only: keep the independent leg artwork, hip and shoe intact. */
window.SEATED_LEG=(()=>{
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  function deform(x,y,c){
    const w=smooth((x-c.hipX)/(c.kneeX-c.hipX))*(y<=c.kneeY?1:smooth((c.shoeY-y)/(c.shoeY-c.kneeY)));
    return [x+c.dx*w,y+c.dy*w];
  }
  function outline(points,c){
    const out=[];
    for(let i=0;i<points.length;i+=2){const j=(i+2)%points.length;
      for(let k=0;k<8;k++){const t=k/8;out.push(...deform(points[i]*(1-t)+points[j]*t,points[i+1]*(1-t)+points[j+1]*t,c));}
    }
    return out;
  }
  function canvasTexture(source,w,h,c,m){
    // Rasterize once at scene resolution, avoiding a second shear/downsample.
    const world=([x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]],n=c.grid,triangles=[];
    let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const a=[x*w/n,y*h/n],b=[(x+1)*w/n,y*h/n],d=[(x+1)*w/n,(y+1)*h/n],e=[x*w/n,(y+1)*h/n];
      for(const src of [[a,b,e],[b,d,e]]){const dst=src.map(p=>world(deform(...p,c)));triangles.push([src,dst]);
        dst.forEach(([x,y])=>{left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);});}
    }
    left=Math.floor(left);top=Math.floor(top);
    const canvas=document.createElement('canvas');canvas.width=Math.ceil(right)-left;canvas.height=Math.ceil(bottom)-top;
    const ctx=canvas.getContext('2d');
    function triangle(src,d){
      const [a,b,c]=src,[p,r,t]=d,u=b[0]-a[0],v=b[1]-a[1],q=c[0]-a[0],z=c[1]-a[1],det=u*z-v*q;
      const A=((r[0]-p[0])*z-(t[0]-p[0])*v)/det,B=((r[1]-p[1])*z-(t[1]-p[1])*v)/det,C=((t[0]-p[0])*u-(r[0]-p[0])*q)/det,D=((t[1]-p[1])*u-(r[1]-p[1])*q)/det;
      const center=[(p[0]+r[0]+t[0])/3,(p[1]+r[1]+t[1])/3];ctx.save();ctx.beginPath();
      d.forEach((v,i)=>{const dx=v[0]-center[0],dy=v[1]-center[1],length=Math.hypot(dx,dy),x=v[0]+dx/length*.18,y=v[1]+dy/length*.18;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
      ctx.closePath();ctx.clip();ctx.setTransform(A,B,C,D,p[0]-A*a[0]-C*a[1],p[1]-B*a[0]-D*a[1]);ctx.drawImage(source,0,0);ctx.restore();
    }
    triangles.forEach(([src,dst])=>triangle(src,dst.map(([x,y])=>[x-left,y-top])));
    return {canvas,matrix:[1,0,0,1,left,top]};
  }
  function install({PIXI,app,manifest,named}){
    const old=named.get('rightleg');if(!old?.parent)return;
    const parent=old.parent,index=parent.getChildIndex(old),c=manifest.rightLegBend;
    let replacement,matrix=manifest.objects.rightleg.matrix;
    if(app.renderer.name==='canvas'){
      const raster=canvasTexture(old.texture.source.resource,old.texture.width,old.texture.height,c,matrix);
      const texture=PIXI.Texture.from(raster.canvas);matrix=raster.matrix;
      replacement=new PIXI.Sprite({texture});
    }else{
      replacement=new PIXI.MeshPlane({texture:old.texture,verticesX:c.grid+1,verticesY:c.grid+1});
      const buffer=replacement.geometry.getAttribute('aPosition').buffer;
      for(let i=0;i<buffer.data.length;i+=2){const p=deform(buffer.data[i],buffer.data[i+1],c);buffer.data[i]=p[0];buffer.data[i+1]=p[1];}buffer.update();
    }
    replacement.setFromMatrix(new PIXI.Matrix(...matrix));
    replacement.label='rightleg';replacement.eventMode='none';replacement.mask=old.mask;
    parent.removeChild(old);parent.addChildAt(replacement,index);named.set('rightleg',replacement);
  }
  return {deform,outline,install};
})();
