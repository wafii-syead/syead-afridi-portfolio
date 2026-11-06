'use client';
import {useEffect,useRef} from 'react';
type V=[number,number,number];
const normalize=(v:V):V=>{const m=Math.hypot(...v);return v.map(x=>x/m) as V;};
function sphereMesh(detail=1){
 const t=(1+Math.sqrt(5))/2;
 const v:V[]=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(v=>normalize(v as V));
 const f=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 let faces=f.map(a=>a.map(i=>v[i]));
 for(let d=0;d<detail;d++)faces=faces.flatMap(([a,b,c])=>{const ab=normalize(a.map((x,i)=>(x+b[i])/2) as V),bc=normalize(b.map((x,i)=>(x+c[i])/2) as V),ca=normalize(c.map((x,i)=>(x+a[i])/2) as V);return [[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]];});
 return faces;
}
const mesh=sphereMesh(1);
export default function Orbit({active,paused}:{active:number;paused:boolean}){
 const ref=useRef<HTMLCanvasElement>(null),activeRef=useRef(active),pauseRef=useRef(paused);
 useEffect(()=>{activeRef.current=active;},[active]);useEffect(()=>{pauseRef.current=paused;},[paused]);
 useEffect(()=>{
  const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  let width=1,height=1,raf=0,time=0,last=0,visible=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resize=()=>{const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const d=Math.min(devicePixelRatio,2);canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);};
  const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;});io.observe(canvas);
  function ball(cx:number,cy:number,r:number,angle:number,hue:number){
   if(!ctx)return;
   const glow=ctx.createRadialGradient(cx-r*.22,cy-r*.3,r*.7,cx,cy,r*1.35);glow.addColorStop(0,'transparent');glow.addColorStop(.5,'hsla('+hue+',60%,58%,.035)');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(cx-r*1.4,cy-r*1.4,r*2.8,r*2.8);
   const rotate=(v:V):V=>{const x=v[0]*Math.cos(angle)+v[2]*Math.sin(angle),z=-v[0]*Math.sin(angle)+v[2]*Math.cos(angle),y=v[1]*Math.cos(.3)-z*Math.sin(.3);return [x,y,v[1]*Math.sin(.3)+z*Math.cos(.3)];};
   const faces=mesh.map((f,i)=>{const p=f.map(rotate);return {p,i,z:p.reduce((n,v)=>n+v[2],0)/3};}).sort((a,b)=>a.z-b.z);
   for(const {p,i,z} of faces){
    if(z<-.12)continue;
    const center=normalize(p.reduce((a,v)=>a.map((x,j)=>x+v[j]) as V,[0,0,0] as V));
    const light=Math.max(0,center[0]*-.55+center[1]*-.65+center[2]*.55);
    const reflect=Math.pow(Math.max(0,center[0]*-.35+center[1]*-.4+center[2]*.85),15);
    const l=8+light*30+reflect*46+(i%5===0?7:0);
    const points=p.map(v=>[cx+v[0]*r,cy+v[1]*r]);
    const mean=points.reduce((a,v)=>[a[0]+v[0]/3,a[1]+v[1]/3],[0,0]);
    ctx.beginPath();points.forEach((v,j)=>{const x=mean[0]+(v[0]-mean[0])*.95,y=mean[1]+(v[1]-mean[1])*.95;j===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.closePath();
    const grad=ctx.createLinearGradient(points[0][0],points[0][1],points[2][0],points[2][1]);grad.addColorStop(0,'hsl('+hue+', '+(25+reflect*5)+'%, '+Math.min(92,l+12)+'%)');grad.addColorStop(.14,'hsl('+hue+',40%,'+Math.min(90,l+3)+'%)');grad.addColorStop(.85,'hsl('+hue+',35%,'+Math.max(4,l-7)+'%)');grad.addColorStop(1,'hsl('+hue+',22%,'+Math.min(85,l+16)+'%)');ctx.fillStyle=grad;ctx.fill();
    ctx.strokeStyle='hsla('+hue+',35%,75%,'+(.08+light*.3)+')';ctx.lineWidth=.7;ctx.stroke();
   }
   const shine=ctx.createRadialGradient(cx-r*.4,cy-r*.68,0,cx-r*.4,cy-r*.68,r*.35);shine.addColorStop(0,'rgba(227,230,255,.23)');shine.addColorStop(1,'transparent');ctx.fillStyle=shine;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
  }
  function draw(now:number){
   if(!ctx)return;
   const delta=Math.min(40,now-last);last=now;if(!pauseRef.current&&!reduced&&visible)time+=delta*.00012;
   if(visible){
    ctx.clearRect(0,0,width,height);
    const s=width/700,cy=height*.46;
    ctx.save();ctx.translate(width*.54,cy);ctx.rotate(-.55);ctx.strokeStyle='rgba(165,175,210,.14)';ctx.lineWidth=.65;ctx.beginPath();ctx.ellipse(0,0,285*s,133*s,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,340*s,195*s,.35,0,Math.PI*2);ctx.stroke();ctx.restore();
    ball(width*.83,height*.18,43*s,time*.5,164);
    ball(width*.17,height*.35,64*s,-time*.8,222);
    ball(width*.88,height*.77,77*s,-time*.7,245);
    ball(width*.53,height*.46,171*s,time,activeRef.current===0?247:activeRef.current===1?213:151);
    for(let i=0;i<15;i++){const x=(Math.sin(i*37.8)*.5+.5)*width,y=(Math.cos(i*8.2)*.5+.5)*height;ctx.fillStyle='rgba(220,229,246,'+(.15+(i%3)*.13)+')';ctx.beginPath();ctx.arc(x,y,i%4===0?1.5:.65,0,Math.PI*2);ctx.fill();}
   }
   raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();};
 },[]);
 return <canvas ref={ref} className="orbit-canvas" aria-hidden="true"/>;
}