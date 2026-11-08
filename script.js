(() => {
'use strict';
const host=document.getElementById('robot');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x100719);
const camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(5.5,3.35,9.7);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.appendChild(renderer.domElement);
const controls=new THREE.OrbitControls(camera,renderer.domElement);controls.target.set(0,2.05,0);controls.enableDamping=true;controls.minDistance=3.5;controls.maxDistance=17;camera.lookAt(controls.target);
scene.add(new THREE.HemisphereLight(0xe9e6ef,0x211822,1.45));const sun=new THREE.DirectionalLight(0xffffff,2.35);sun.position.set(4,8,6);scene.add(sun);const fill=new THREE.PointLight(0xf6bb84,1.05,13);fill.position.set(-4,4,4);scene.add(fill);
const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.55,metalness:.12});const white=mat(0xf3f5fa),dark=mat(0x1a1723),metal=mat(0x737582),blue=new THREE.MeshStandardMaterial({color:0x42bbff,emissive:0x0a82ff,emissiveIntensity:1.6,roughness:.16}),black=mat(0x080a15);
function box(parent,w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o}
function sphere(parent,r,x,y,z,m){const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),m);o.position.set(x,y,z);parent.add(o);return o}
function pivot(parent,x,y,z){const o=new THREE.Group();o.position.set(x,y,z);parent.add(o);return o}
// ===== V10 robot: rounded shell, face screen, curved smiling LED eyes =====
function roundedGeometry(w,h,depth,r=.1){
 const shape=new THREE.Shape(),x=-w/2,y=-h/2;
 shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);
 shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
 shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);
 shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
 const g=new THREE.ExtrudeGeometry(shape,{depth:Math.max(.015,depth-.09),bevelEnabled:true,bevelThickness:.045,bevelSize:.045,bevelSegments:3,steps:1,curveSegments:6});
 g.translate(0,0,-(depth-.09)/2);g.computeVertexNormals();return g;
}
function roundedBox(parent,w,h,d,x,y,z,m,r=.12){
 const o=new THREE.Mesh(roundedGeometry(w,h,d,r),m);o.position.set(x,y,z);parent.add(o);return o;
}
const robot=new THREE.Group();scene.add(robot);
const armor=new THREE.MeshStandardMaterial({color:0xf1f1f3,metalness:.08,roughness:.32});
const screenMat=new THREE.MeshStandardMaterial({color:0x070c15,metalness:.1,roughness:.12});
const eyeMat=new THREE.MeshBasicMaterial({color:0x7ddcff});
const eyeGlow=new THREE.MeshBasicMaterial({color:0x128bff,transparent:true,opacity:.28});
roundedBox(robot,1.30,1.12,.64,0,2.78,0,armor,.17);
roundedBox(robot,1.12,.12,.55,0,3.37,0,dark,.05);
roundedBox(robot,.86,.30,.51,0,2.13,0,metal,.08);
roundedBox(robot,.19,.19,.20,0,3.49,0,metal,.05);
// Head is intentionally larger and softer, like the reference render.
const head=roundedBox(robot,.95,.72,.59,0,3.93,0,armor,.19);
const face=roundedBox(robot,.78,.49,.05,0,3.94,.315,screenMat,.16);
function smileEye(cx){
 const points=[],glowPoints=[];
 for(let i=0;i<=24;i++){
  const t=i/24;
  const x=cx+(t-.5)*.245;
  const y=3.915+.117*Math.sin(Math.PI*t);
  points.push(new THREE.Vector3(x,y,.375));
  glowPoints.push(new THREE.Vector3(x,y,.372));
 }
 const curve=new THREE.CatmullRomCurve3(points);
 const glowCurve=new THREE.CatmullRomCurve3(glowPoints);
 robot.add(new THREE.Mesh(new THREE.TubeGeometry(glowCurve,32,.033,8,false),eyeGlow));
 robot.add(new THREE.Mesh(new THREE.TubeGeometry(curve,32,.016,8,false),eyeMat));
}
smileEye(-.215);smileEye(.215);
// User-provided logo is a texture rather than retyped text.
const logoTexture=new THREE.TextureLoader().load('./nmsu-logo.png');
logoTexture.encoding=THREE.sRGBEncoding;
const logoPanel=new THREE.Mesh(new THREE.PlaneGeometry(.73,.71),new THREE.MeshBasicMaterial({map:logoTexture,side:THREE.DoubleSide}));
logoPanel.position.set(0,2.79,.37);robot.add(logoPanel);
const joints=[];
function register(name,parent,axis,min,max){joints.push({name,parent,axis,min,max});return parent}
function arm(side){const s=side==='Left'?-1:1;const shoulder=pivot(robot,s*.75,3.11,0);sphere(shoulder,.16,0,0,0,metal);
register(side+' shoulder forward',shoulder,'x',-180,90);
const roll=pivot(shoulder,0,0,0);register(side+' shoulder sideways',roll,'z',side==='Left'?-180:0,side==='Left'?0:180);
roundedBox(roll,.34,.66,.36,0,-.38,0,armor,.09);box(roll,.32,.24,.36,0,-.25,0,dark);
const elbow=pivot(roll,0,-.78,0);sphere(elbow,.13,0,0,0,metal);register(side+' elbow',elbow,'x',-125,0);
roundedBox(elbow,.30,.60,.33,0,-.36,0,armor,.09);box(elbow,.31,.14,.33,0,-.57,0,dark);box(elbow,.23,.24,.25,0,-.77,.02,metal);
}
function leg(side){const s=side==='Left'?-1:1;const hip=pivot(robot,s*.36,2.05,0);sphere(hip,.16,0,0,0,metal);register(side+' hip forward',hip,'x',-85,85);
const hipRoll=pivot(hip,0,0,0);register(side+' hip sideways',hipRoll,'z',side==='Left'?-45:0,side==='Left'?0:45);
roundedBox(hipRoll,.46,.75,.46,0,-.45,0,armor,.09);box(hipRoll,.44,.24,.45,0,-.29,0,dark);
const knee=pivot(hipRoll,0,-.90,0);sphere(knee,.15,0,0,0,metal);register(side+' knee',knee,'x',0,120);
roundedBox(knee,.40,.69,.42,0,-.42,0,armor,.09);box(knee,.40,.22,.43,0,-.30,0,dark);
const ankle=pivot(knee,0,-.87,0);sphere(ankle,.13,0,0,0,metal);register(side+' ankle forward',ankle,'x',-55,55);
const ankleRoll=pivot(ankle,0,0,0);register(side+' ankle sideways',ankleRoll,'z',-35,35);
roundedBox(ankleRoll,.49,.19,.80,0,-.11,.18,armor,.08);box(ankleRoll,.43,.07,.76,0,-.21,.18,dark);
}
arm('Left');arm('Right');leg('Left');leg('Right');
const sliders=document.getElementById('sliders');joints.forEach((j,i)=>{const div=document.createElement('div');div.className='joint';const label=document.createElement('label');const name=document.createElement('span');name.textContent=String(i+1).padStart(2,'0')+' · '+j.name;const value=document.createElement('output');value.textContent='0°';label.append(name,value);const input=document.createElement('input');input.type='range';input.min=j.min;input.max=j.max;input.value=0;input.step=1;input.addEventListener('input',()=>{j.parent.rotation[j.axis]=Number(input.value)*Math.PI/180;value.textContent=input.value+'°'});div.append(label,input);sliders.appendChild(div);j.input=input;j.value=value});
function getPose(){return joints.map(j=>Number(j.input.value))}
function setPose(pose){joints.forEach((j,i)=>{const angle=Math.max(j.min,Math.min(j.max,Number(pose[i])||0));j.parent.rotation[j.axis]=angle*Math.PI/180;j.input.value=angle;j.value.textContent=angle+'°'})}
const status=document.getElementById('status');
function announce(msg){status.textContent=msg}
let savedPoses=[],frames=[],playing=false,playToken=0,selected=-1;
function stopPlayback(){playing=false;playToken++;document.getElementById('playDance').disabled=false}
function resetPose(){stopPlayback();setPose(Array(joints.length).fill(0));announce('Reset to neutral pose.')}
document.getElementById('reset').addEventListener('click',resetPose);
document.getElementById('mirrorPose').addEventListener('click',()=>{
 stopPlayback();const old=getPose(),newPose=old.slice();
 for(let i=0;i<joints.length;i++){
  const name=joints[i].name;
  const other=name.startsWith('Left ')?'Right '+name.slice(5):name.startsWith('Right ')?'Left '+name.slice(6):null;
  if(!other)continue;
  const j=joints.findIndex(j=>j.name===other);
  if(j<0)continue;
  const sign=name.includes('sideways')?-1:1;
  newPose[i]=Math.max(joints[i].min,Math.min(joints[i].max,old[j]*sign));
 }
 setPose(newPose);announce('Mirrored left/right joint poses.');
});
function validPose(p){return Array.isArray(p)&&p.length===joints.length&&p.every(x=>typeof x==='number'&&Number.isFinite(x))}
function durationValue(){const el=document.getElementById('frameDuration');const ms=Number(el.value);return Number.isFinite(ms)?Math.max(100,Math.min(10000,Math.round(ms))):500}
function makeButton(label,action){const b=document.createElement('button');b.textContent=label;b.addEventListener('click',action);return b}
function renderPoses(){
 const list=document.getElementById('savedPoses');list.replaceChildren();
 if(!savedPoses.length){list.textContent='No saved poses yet.';return}
 savedPoses.forEach((p,i)=>{
  const item=document.createElement('div');item.className='item item-line';
  const name=document.createElement('span');name.textContent=p.name;
  const actions=document.createElement('div');actions.className='item-actions';
  actions.append(
   makeButton('Apply',()=>{stopPlayback();setPose(p.angles);announce('Applied '+p.name)}),
   makeButton('Add to Dance',()=>{
    stopPlayback();frames.push({duration:durationValue(),angles:p.angles.slice()});
    selected=frames.length-1;renderFrames();announce('Added '+p.name+' as frame '+frames.length);
   }),
   makeButton('Delete',()=>{savedPoses.splice(i,1);renderPoses()})
  );
  item.append(name,actions);list.append(item);
 });
}
function renderFrames(){const list=document.getElementById('timeline');list.replaceChildren();document.getElementById('frameCount').textContent=frames.length+' frame'+(frames.length===1?'':'s');if(!frames.length){list.textContent='No frames yet. Add Frame to build a dance.';return}frames.forEach((f,i)=>{const item=document.createElement('div');item.className='item'+(i===selected?' selected':'');const top=document.createElement('div');top.className='item-line';const name=document.createElement('strong');name.textContent='Frame '+(i+1);const d=document.createElement('input');d.type='number';d.min=100;d.max=10000;d.step=100;d.value=f.duration;d.title='Duration in milliseconds';d.addEventListener('change',()=>{const v=Number(d.value);f.duration=Number.isFinite(v)?Math.max(100,Math.min(10000,Math.round(v))):500;d.value=f.duration});const ms=document.createElement('span');ms.textContent='ms';top.append(name,d,ms);const actions=document.createElement('div');actions.className='item-actions';actions.append(makeButton('Duplicate',()=>{stopPlayback();frames.splice(i+1,0,{angles:f.angles.slice(),duration:f.duration});selected=i+1;renderFrames();announce('Duplicated frame '+(i+1)+' as frame '+(i+2))}),makeButton('View',()=>{stopPlayback();selected=i;setPose(f.angles);renderFrames();announce('Viewing frame '+(i+1))}),makeButton('Update',()=>{stopPlayback();f.angles=getPose();selected=i;renderFrames();announce('Updated frame '+(i+1))}),makeButton('↑',()=>{if(i>0){[frames[i-1],frames[i]]=[frames[i],frames[i-1]];selected=-1;renderFrames()}}),makeButton('↓',()=>{if(i<frames.length-1){[frames[i+1],frames[i]]=[frames[i],frames[i+1]];selected=-1;renderFrames()}}),makeButton('Delete',()=>{stopPlayback();frames.splice(i,1);selected=-1;renderFrames()}));item.append(top,actions);list.append(item)})}
document.getElementById('savePose').addEventListener('click',()=>{stopPlayback();savedPoses.push({name:'Pose '+(savedPoses.length+1),angles:getPose()});renderPoses();announce('Pose saved. Use Apply to recall it.')});
document.getElementById('addFrame').addEventListener('click',()=>{stopPlayback();frames.push({duration:durationValue(),angles:getPose()});selected=frames.length-1;renderFrames();announce('Added frame '+frames.length)});
function lerpPose(a,b,t){return a.map((v,i)=>v+(b[i]-v)*t)}
async function playDance(){
 if(!frames.length){announce('Add at least one frame first.');return}
 stopPlayback();
 playing=true;
 const token=playToken;
 const playButton=document.getElementById('playDance');
 const loopInput=document.getElementById('loopDance');
 const speedInput=document.getElementById('playbackSpeed');
 if(!loopInput||!speedInput){playing=false;playButton.disabled=false;announce('V8.2 error: missing playback controls. Refresh page.');return}
 playButton.disabled=true;
 let from=getPose();
 let cycle=0;
 try {
  do {
   for(let i=0;i<frames.length;i++){
    if(!playing||token!==playToken)return;
    selected=i;renderFrames();
    const to=frames[i].angles.slice();
    const speed=Number(speedInput.value)||1;
    const duration=frames[i].duration/speed;
    announce('Playing · cycle '+(cycle+1)+' · frame '+(i+1)+'/'+frames.length+' · '+speed+'×'+(loopInput.checked?' · Loop ON':' · Loop OFF'));
    const start=performance.now();
    await new Promise(resolve=>{
     function tick(now){
      if(!playing||token!==playToken){resolve();return}
      const t=Math.min(1,(now-start)/duration);
      setPose(lerpPose(from,to,t));
      if(t<1)requestAnimationFrame(tick);
      else resolve();
     }
     requestAnimationFrame(tick);
    });
    if(!playing||token!==playToken)return;
    from=to;
   }
   cycle++;
   if(playing&&token===playToken&&loopInput.checked) announce('Loop ON · completed '+cycle+' cycle(s), restarting…');
  } while(playing&&token===playToken&&loopInput.checked&&frames.length);
  
   if(playing&&token===playToken)announce('Dance complete! (Loop '+(loopInput.checked?'ON':'OFF')+', '+(Number(speedInput.value)||1)+'×)');
 } finally {
  if(token===playToken){playing=false;playButton.disabled=false}
 }
}
document.getElementById('playDance').addEventListener('click',()=>playDance());
document.getElementById('stopDance').addEventListener('click',()=>{stopPlayback();announce('Playback stopped.')});
document.getElementById('downloadDance').addEventListener('click',()=>{const data={format:'RoboSoulDanceStudio',version:1,joints:joints.map(j=>({name:j.name,min:j.min,max:j.max})),poses:savedPoses,frames};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='nmsu-dance.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Dance JSON downloaded.')});
document.getElementById('loadDance').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.format!=='RoboSoulDanceStudio'||data.version!==1||!Array.isArray(data.frames)||data.frames.length>2000||!data.frames.every(f=>validPose(f.angles)&&Number.isFinite(f.duration)&&f.duration>=100&&f.duration<=10000)||!Array.isArray(data.poses)||data.poses.length>2000||!data.poses.every(p=>typeof p.name==='string'&&validPose(p.angles))||!Array.isArray(data.joints)||data.joints.length!==joints.length||!data.joints.every((j,i)=>j.name===joints[i].name))throw Error('Incompatible or invalid dance JSON');stopPlayback();frames=data.frames.map(f=>({angles:f.angles.slice(),duration:f.duration}));savedPoses=data.poses.map(p=>({name:p.name.slice(0,80),angles:p.angles.slice()}));selected=-1;renderFrames();renderPoses();announce('Dance loaded: '+frames.length+' frames.')}catch(err){announce('Could not load: '+err.message)}e.target.value=''});
renderPoses();renderFrames();



// Featured dances are bundled into script.js: no separate JSON files needed.
const presetDances={"flash":{"frames":[{"angles":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"duration":450},{"angles":[-38,-55,-35,15,12,-35,14,-20,20,-8,0,-9,4,12,-8,0],"duration":240},{"angles":[-18,-25,-30,-18,25,-30,0,0,8,0,0,0,0,8,0,0],"duration":190},{"angles":[15,-12,-35,-38,55,-35,-9,-4,12,-8,0,14,20,20,-8,0],"duration":240},{"angles":[-18,-25,-30,-18,25,-30,0,0,8,0,0,0,0,8,0,0],"duration":190},{"angles":[-38,-55,-35,15,12,-35,14,-20,20,-8,0,-9,4,12,-8,0],"duration":240},{"angles":[-18,-25,-30,-18,25,-30,0,0,8,0,0,0,0,8,0,0],"duration":190},{"angles":[15,-12,-35,-38,55,-35,-9,-4,12,-8,0,14,20,20,-8,0],"duration":240},{"angles":[-18,-25,-30,-18,25,-30,0,0,8,0,0,0,0,8,0,0],"duration":190},{"angles":[-38,-55,-35,15,12,-35,14,-20,20,-8,0,-9,4,12,-8,0],"duration":240},{"angles":[-18,-25,-30,-18,25,-30,0,0,8,0,0,0,0,8,0,0],"duration":190},{"angles":[15,-12,-35,-38,55,-35,-9,-4,12,-8,0,14,20,20,-8,0],"duration":240},{"angles":[-18,-25,-30,-18,25,-30,0,0,8,0,0,0,0,8,0,0],"duration":190},{"angles":[-38,-55,-35,15,12,-35,14,-20,20,-8,0,-9,4,12,-8,0],"duration":240},{"angles":[-18,-25,-30,-18,25,-30,0,0,8,0,0,0,0,8,0,0],"duration":190},{"angles":[15,-12,-35,-38,55,-35,-9,-4,12,-8,0,14,20,20,-8,0],"duration":240},{"angles":[-18,-25,-30,-18,25,-30,0,0,8,0,0,0,0,8,0,0],"duration":190},{"angles":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"duration":450}],"joints":["Left shoulder forward","Left shoulder sideways","Left elbow","Right shoulder forward","Right shoulder sideways","Right elbow","Left hip forward","Left hip sideways","Left knee","Left ankle forward","Left ankle sideways","Right hip forward","Right hip sideways","Right knee","Right ankle forward","Right ankle sideways"]},"kick":{"frames":[{"angles":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"duration":450},{"angles":[12,-45,-55,-45,45,-55,47,0,72,-12,0,-10,0,12,0,0],"duration":360},{"angles":[12,-45,-55,-45,45,-55,38,0,14,10,0,-10,0,12,0,0],"duration":270},{"angles":[-20,0,0,-20,0,0,0,0,10,0,0,0,0,10,0,0],"duration":280},{"angles":[-45,-45,-55,12,45,-55,-10,0,12,0,0,47,0,72,-12,0],"duration":360},{"angles":[-45,-45,-55,12,45,-55,-10,0,12,0,0,38,0,14,10,0],"duration":270},{"angles":[-20,0,0,-20,0,0,0,0,10,0,0,0,0,10,0,0],"duration":280},{"angles":[12,-45,-55,-45,45,-55,47,0,72,-12,0,-10,0,12,0,0],"duration":360},{"angles":[12,-45,-55,-45,45,-55,38,0,14,10,0,-10,0,12,0,0],"duration":270},{"angles":[-20,0,0,-20,0,0,0,0,10,0,0,0,0,10,0,0],"duration":280},{"angles":[-45,-45,-55,12,45,-55,-10,0,12,0,0,47,0,72,-12,0],"duration":360},{"angles":[-45,-45,-55,12,45,-55,-10,0,12,0,0,38,0,14,10,0],"duration":270},{"angles":[-20,0,0,-20,0,0,0,0,10,0,0,0,0,10,0,0],"duration":280},{"angles":[12,-45,-55,-45,45,-55,47,0,72,-12,0,-10,0,12,0,0],"duration":360},{"angles":[12,-45,-55,-45,45,-55,38,0,14,10,0,-10,0,12,0,0],"duration":270},{"angles":[-20,0,0,-20,0,0,0,0,10,0,0,0,0,10,0,0],"duration":280},{"angles":[-45,-45,-55,12,45,-55,-10,0,12,0,0,47,0,72,-12,0],"duration":360},{"angles":[-45,-45,-55,12,45,-55,-10,0,12,0,0,38,0,14,10,0],"duration":270},{"angles":[-20,0,0,-20,0,0,0,0,10,0,0,0,0,10,0,0],"duration":280},{"angles":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"duration":500}],"joints":["Left shoulder forward","Left shoulder sideways","Left elbow","Right shoulder forward","Right shoulder sideways","Right elbow","Left hip forward","Left hip sideways","Left knee","Left ankle forward","Left ankle sideways","Right hip forward","Right hip sideways","Right knee","Right ankle forward","Right ankle sideways"]},"bear":{"frames":[{"angles":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"duration":420},{"angles":[-28,-99,-65,-48,125,-91,8,-11,28,-8,0,8,4,18,-8,0],"duration":185},{"angles":[-48,-125,-91,-28,99,-65,8,-4,18,-8,0,8,11,28,-8,0],"duration":185},{"angles":[-45,-105,-72,-45,105,-72,0,0,20,0,0,0,0,20,0,0],"duration":170},{"angles":[-28,-99,-65,-48,125,-91,8,-11,28,-8,0,8,4,18,-8,0],"duration":185},{"angles":[-48,-125,-91,-28,99,-65,8,-4,18,-8,0,8,11,28,-8,0],"duration":185},{"angles":[-45,-105,-72,-45,105,-72,0,0,20,0,0,0,0,20,0,0],"duration":170},{"angles":[-28,-99,-65,-48,125,-91,8,-11,28,-8,0,8,4,18,-8,0],"duration":185},{"angles":[-48,-125,-91,-28,99,-65,8,-4,18,-8,0,8,11,28,-8,0],"duration":185},{"angles":[-45,-105,-72,-45,105,-72,0,0,20,0,0,0,0,20,0,0],"duration":170},{"angles":[-28,-99,-65,-48,125,-91,8,-11,28,-8,0,8,4,18,-8,0],"duration":185},{"angles":[-48,-125,-91,-28,99,-65,8,-4,18,-8,0,8,11,28,-8,0],"duration":185},{"angles":[-45,-105,-72,-45,105,-72,0,0,20,0,0,0,0,20,0,0],"duration":170},{"angles":[-28,-99,-65,-48,125,-91,8,-11,28,-8,0,8,4,18,-8,0],"duration":185},{"angles":[-48,-125,-91,-28,99,-65,8,-4,18,-8,0,8,11,28,-8,0],"duration":185},{"angles":[-45,-105,-72,-45,105,-72,0,0,20,0,0,0,0,20,0,0],"duration":170},{"angles":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"duration":450}],"joints":["Left shoulder forward","Left shoulder sideways","Left elbow","Right shoulder forward","Right shoulder sideways","Right elbow","Left hip forward","Left hip sideways","Left knee","Left ankle forward","Left ankle sideways","Right hip forward","Right hip sideways","Right knee","Right ankle forward","Right ankle sideways"]}};
for(const el of document.querySelectorAll('[data-dance]')){
 el.addEventListener('click',()=>{
  const key=el.dataset.dance,dance=presetDances[key];
  if(!dance||dance.joints.length!==joints.length||!dance.joints.every((n,i)=>n===joints[i].name)||!dance.frames.every(f=>validPose(f.angles))){announce('内置舞蹈与关节配置不匹配。');return}
  stopPlayback();
  frames=dance.frames.map(f=>({angles:f.angles.slice(),duration:f.duration}));
  selected=-1;renderFrames();
  setPose(Array(joints.length).fill(0));
  document.getElementById('loopDance').checked=false;
  playDance();
 });
}
// ===== V10 stage: NMSU maroon / warm-white / amber, no pink =====
const stage=new THREE.Group();scene.add(stage);
const floorMat=new THREE.MeshStandardMaterial({color:0x321a24,roughness:.27,metalness:.46});
const floor=new THREE.Mesh(new THREE.CylinderGeometry(5.8,5.9,.17,80),floorMat);
floor.position.y=-.19;stage.add(floor);
const innerMat=new THREE.MeshStandardMaterial({color:0x4a202d,roughness:.28,metalness:.45});
const inner=new THREE.Mesh(new THREE.CylinderGeometry(4.1,4.12,.045,80),innerMat);
inner.position.y=-.06;stage.add(inner);
const rimMat=new THREE.MeshBasicMaterial({color:0xf6b76e});
const rim=new THREE.Mesh(new THREE.TorusGeometry(4.13,.034,8,96),rimMat);
rim.rotation.x=Math.PI/2;rim.position.y=-.015;stage.add(rim);
const grid=new THREE.GridHelper(8.1,16,0x8a4b56,0x4d3037);grid.position.y=-.029;stage.add(grid);
const trussMat=new THREE.MeshStandardMaterial({color:0x56515b,metalness:.85,roughness:.28});
function stageBox(w,h,d,x,y,z,m){return box(stage,w,h,d,x,y,z,m)}
for(const x of [-4.5,4.5]){
 stageBox(.13,5.9,.14,x,2.79,-3.45,trussMat);
 for(let y=.45;y<5.5;y+=.48){stageBox(.3,.055,.15,x,y,-3.45,trussMat)}
}
stageBox(9.1,.15,.17,0,5.58,-3.45,trussMat);
for(let x=-4.2;x<=4.2;x+=.4)stageBox(.028,.15,.19,x,5.58,-3.45,trussMat);
// Large branded LED wall with the user's own NMSU logo asset.
const wallCanvas=document.createElement('canvas');wallCanvas.width=1200;wallCanvas.height=680;
const ctx=wallCanvas.getContext('2d');
const grad=ctx.createLinearGradient(0,0,1200,680);
grad.addColorStop(0,'#390b20');grad.addColorStop(.54,'#70233a');grad.addColorStop(1,'#290e20');
ctx.fillStyle=grad;ctx.fillRect(0,0,1200,680);
ctx.fillStyle='#e8b3a51a';for(let i=0;i<8;i++)ctx.fillRect(i*180,0,75,680);
ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.font='bold 182px Georgia,serif';ctx.fillText('NM',600,255);
ctx.font='bold 142px Georgia,serif';ctx.fillText('STATE',600,403);
ctx.font='bold 57px Georgia,serif';ctx.fillText('UNIVERSITY',600,484);
ctx.strokeStyle='#f2e6e9';ctx.lineWidth=8;ctx.strokeRect(265,64,670,475);
ctx.fillStyle='#e6c5c4';ctx.font='bold 30px Arial';ctx.fillText('ROBOTICS  •  COMPUTING  •  DANCE',600,606);
const wallTexture=new THREE.CanvasTexture(wallCanvas);wallTexture.encoding=THREE.sRGBEncoding;
const wall=new THREE.Mesh(new THREE.PlaneGeometry(8.25,4.35),new THREE.MeshBasicMaterial({map:wallTexture,side:THREE.DoubleSide}));
wall.position.set(0,3.0,-3.75);stage.add(wall);
function speaker(x){
 const group=new THREE.Group();group.position.set(x,1.04,-3.12);stage.add(group);
 roundedBox(group,.74,1.83,.67,0,0,0,mat(0x13131a),.07);
 for(const y of [-.50,.33]){
  const disk=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.03,32),mat(0x32303a));
  disk.rotation.x=Math.PI/2;disk.position.set(0,y,.36);group.add(disk);
  const cone=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.033,32),mat(0x16161d));
  cone.rotation.x=Math.PI/2;cone.position.set(0,y,.385);group.add(cone);
 }
}
speaker(-4.05);speaker(4.05);
// Physical spotlight fixtures and subtle translucent cones (not just colored light).
const spotlights=[],beamMeshes=[];
const spotlightColors=[0xffe4bb,0xffc47a,0xe8f1ff,0xffffff,0xf6bc81,0xd8e8ff];
for(let i=0;i<6;i++){
 const x=-3.6+i*1.44;
 const light=new THREE.SpotLight(spotlightColors[i],1.9,13,Math.PI/7,.8,1.5);
 light.position.set(x,5.3,-3.0);
 light.target.position.set((i-2.5)*.35,.4,0);
 stage.add(light);stage.add(light.target);spotlights.push(light);
 const lamp=new THREE.Mesh(new THREE.CylinderGeometry(.19,.21,.21,16),mat(0x15151c));
 lamp.rotation.x=Math.PI/2;lamp.position.copy(light.position);stage.add(lamp);
 const bulb=new THREE.Mesh(new THREE.SphereGeometry(.12,16,12),new THREE.MeshBasicMaterial({color:spotlightColors[i]}));
 bulb.position.set(x,5.17,-2.93);stage.add(bulb);
 const beam=new THREE.Mesh(new THREE.ConeGeometry(.95,4.2,28,1,true),new THREE.MeshBasicMaterial({color:spotlightColors[i],transparent:true,opacity:.052,depthWrite:false,side:THREE.DoubleSide}));
 beam.position.set(x,3.2,-2.2);stage.add(beam);beamMeshes.push(beam);
}
const stageTheme=document.getElementById('stageTheme'),stageLights=document.getElementById('stageLights');
const themes={
 concert:{bg:0x130d16,floor:0x321a24,inner:0x4a202d,rim:0xf6b76e},
 studio:{bg:0x1a2230,floor:0x303a49,inner:0x424c5b,rim:0xe1ebfa},
 space:{bg:0x060d20,floor:0x111e36,inner:0x172943,rim:0x71c8ff}
};
stageTheme.addEventListener('change',()=>{
 const t=themes[stageTheme.value];scene.background.setHex(t.bg);
 floorMat.color.setHex(t.floor);innerMat.color.setHex(t.inner);rimMat.color.setHex(t.rim);
});
function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}window.addEventListener('resize',resize);resize();
function animate(time){requestAnimationFrame(animate);controls.update();
 const moving=stageLights.checked;
 spotlights.forEach((light,i)=>{light.intensity=moving?2.0:1.35;light.target.position.x=moving?Math.sin(time*.00032+i*1.3)*1.3:(i-2.5)*.32;light.target.position.z=moving?Math.cos(time*.00026+i)*.65:0;beamMeshes[i].visible=moving;beamMeshes[i].rotation.z=moving?Math.sin(time*.00032+i*1.3)*.13:0;});
 renderer.render(scene,camera)}requestAnimationFrame(animate);
})();
