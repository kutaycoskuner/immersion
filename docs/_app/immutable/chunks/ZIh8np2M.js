import{w as we}from"./uWYiJk_L.js";import{aq as ft,C as st,ar as ae,as as ct,B as zt,V as w,i as L,at as dt,au as J,n as re,av as ve,ag as le,O as St,S as Se,a2 as Ee,P as xe,ak as Et,aw as Pe,aj as Te,R as Ft,k as Me,ap as Ot,ao as Ct,Y as Q,K as _t,ax as Ae,ay as De,a as he,r as ut,az as Le,aA as Yt,aB as xt,a8 as K,aC as ze,a1 as ce,c as Oe,Q as it,aD as Ce,aE as $,aF as V,aG as Re,aH as Ue}from"./pwwaY4by.js";class je{_theme=we(localStorage.getItem("color-scheme")||"light");get current(){let t;return this._theme.subscribe(e=>t=e)(),t}get themeStore(){return this._theme}toggle=()=>{const t=this.current==="dark"?"light":"dark";document.documentElement.setAttribute("color-scheme",t),localStorage.setItem("color-scheme",t),this._theme.set(t)}}const Ei=new je;var Rt=`varying vec3 vWorldPosition;

void main() {\r
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);\r
    vWorldPosition = worldPosition.xyz;\r
    gl_Position = projectionMatrix * viewMatrix * worldPosition;\r
}`,Ut=`uniform vec3 uColor; 
varying vec3 vWorldPosition;

void main() {\r
    float distanceFromOrigin = length(vWorldPosition);\r
    float opacity = 0.9 - distanceFromOrigin / 10.0;\r
    opacity = clamp(opacity, 0.0, 0.1);\r
    gl_FragColor = vec4(uColor, opacity); 
}`;const xi=new ft({vertexShader:Rt,fragmentShader:Ut,transparent:!0,vertexColors:!1,uniforms:{uColor:{value:new st(0)}}}),Pi=new ft({vertexShader:Rt,fragmentShader:Ut,transparent:!0,vertexColors:!1,uniforms:{uColor:{value:new st(16711680)}}}),Ti=new ft({vertexShader:Rt,fragmentShader:Ut,transparent:!0,vertexColors:!1,uniforms:{uColor:{value:new st(65280)}}});var ke=Object.defineProperty,Be=(o,t,e)=>t in o?ke(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e,y=(o,t,e)=>Be(o,typeof t!="symbol"?t+"":t,e);const de=(o,t)=>{const[e,i]=t.split("-");return Object.assign(o.style,{left:i==="left"?"0":i==="center"?"50%":"",right:i==="right"?"0":"",top:e==="top"?"0":e==="bottom"?"":"50%",bottom:e==="bottom"?"0":"",transform:`${i==="center"?"translateX(-50%)":""} ${e==="center"?"translateY(-50%)":""}`}),t},Ne=({placement:o,size:t,offset:e,id:i,className:s})=>{const n=document.createElement("div"),{top:r,left:l,right:h,bottom:u}=e;return Object.assign(n.style,{id:i,position:"absolute",zIndex:"1000",height:`${t}px`,width:`${t}px`,margin:`${r}px ${h}px ${u}px ${l}px`,borderRadius:"100%"}),de(n,o),i&&(n.id=i),s&&(n.className=s),n},Ie=o=>{const t=typeof o=="string"?document.querySelector(o):o;if(!t)throw Error("Invalid DOM element");return t};function Pt(o,t,e){return Math.max(t,Math.min(e,o))}const He=[["x",0,3],["y",1,4],["z",2,5]],Gt=new w;function Wt({isSphere:o},t,e){o&&(Gt.set(0,0,1).applyQuaternion(e.quaternion),He.forEach(([i,s,n])=>{const r=Gt[i];let l=t[s],h=l.userData.opacity;l.material.opacity=Pt(r>=0?h:h/2,0,1),l=t[n],h=l.userData.opacity,l.material.opacity=Pt(r>=0?h/2:h,0,1)}))}const Fe=(o,t,e=10)=>Math.abs(o.clientX-t.x)<e&&Math.abs(o.clientY-t.y)<e,Zt=new Pe,qt=new L,Xt=(o,t,e,i)=>{qt.set((o.clientX-t.left)/t.width*2-1,-((o.clientY-t.top)/t.height)*2+1),Zt.setFromCamera(qt,e);const s=Zt.intersectObjects(i,!1),n=s.length?s[0]:null;return!n||!n.object.visible?null:n},yt=1e-6,Ye=2*Math.PI,ue=["x","y","z"],ot=[...ue,"nx","ny","nz"],Ge=["x","z","y","nx","nz","ny"],We=["z","x","y","nz","nx","ny"],Tt="Right",pt="Top",Mt="Front",At="Left",mt="Bottom",Dt="Back",Ze=[Tt,pt,Mt,At,mt,Dt].map(o=>o.toLocaleLowerCase()),pe=1.3,Kt=(o,t=!0)=>{const{material:e,userData:i}=o,{color:s,opacity:n}=t?i.hover:i;e.color.set(s),e.opacity=n},G=o=>JSON.parse(JSON.stringify(o)),qe=o=>{const t=o.type||"sphere",e=t==="sphere",i=o.resolution||e?64:128,s=St.DEFAULT_UP,n=s.z===1,r=s.x===1,{container:l}=o;o.container=void 0,o=JSON.parse(JSON.stringify(o)),o.container=l;const h=n?Ge:r?We:ot;Ze.forEach((c,p)=>{o[c]&&(o[h[p]]=o[c])});const u={enabled:!0,color:16777215,opacity:1,scale:.7,labelColor:2236962,line:!1,border:{size:0,color:14540253},hover:{color:e?16777215:9688043,labelColor:2236962,opacity:1,scale:.7,border:{size:0,color:14540253}}},a={line:!1,scale:e?.45:.7,hover:{scale:e?.5:.7}},d={type:t,container:document.body,size:128,placement:"top-right",resolution:i,lineWidth:4,radius:e?1:.2,smoothness:18,animated:!0,speed:1,background:{enabled:!0,color:e?16777215:14739180,opacity:e?0:1,hover:{color:e?16777215:14739180,opacity:e?.2:1}},font:{family:"sans-serif",weight:900},offset:{top:10,left:10,bottom:10,right:10},corners:{enabled:!e,color:e?15915362:16777215,opacity:1,scale:e?.15:.2,radius:1,smoothness:18,hover:{color:e?16777215:9688043,opacity:1,scale:e?.2:.225}},edges:{enabled:!e,color:e?15915362:16777215,opacity:e?1:0,radius:e?1:.125,smoothness:18,scale:e?.15:1,hover:{color:e?16777215:9688043,opacity:1,scale:e?.2:1}},x:{...G(u),...e?{label:"X",color:16725587,line:!0}:{label:r?pt:Tt}},y:{...G(u),...e?{label:"Y",color:9100032,line:!0}:{label:n||r?Mt:pt}},z:{...G(u),...e?{label:"Z",color:2920447,line:!0}:{label:n?pt:r?Tt:Mt}},nx:{...G(a),label:e?"":r?mt:At},ny:{...G(a),label:e?"":n||r?Dt:mt},nz:{...G(a),label:e?"":n?mt:r?At:Dt}};return Lt(o,d),ue.forEach(c=>Lt(o[`n${c}`],G(o[c]))),{...o,isSphere:e}};function Lt(o,...t){if(o instanceof HTMLElement||typeof o!="object"||o===null)return o;for(const e of t)for(const i in e)i!=="container"&&i in e&&(o[i]===void 0?o[i]=e[i]:typeof e[i]=="object"&&!Array.isArray(e[i])&&(o[i]=Lt(o[i]||{},e[i])));return o}const Xe=(o,t=2)=>{const e=new st,i=t*2,{isSphere:s,resolution:n,radius:r,font:l,corners:h,edges:u}=o,a=ot.map(m=>({...o[m],radius:r}));s&&h.enabled&&a.push(h),s&&u.enabled&&a.push(u);const d=document.createElement("canvas"),c=d.getContext("2d");d.width=n*2+i*2,d.height=n*a.length+i*a.length;const[p,f]=tt(a,n,l);a.forEach(({radius:m,label:x,color:I,labelColor:v,border:S,hover:{color:Y,labelColor:C,border:U}},H)=>{const F=n*H+H*i+t;N(t,F,t,n,m,x,S,I,v),N(n+t*3,F,t,n,m,x,U??S,Y??I,C??v)});const P=a.length,E=t/(n*2),g=t/(n*6),_=1/P,R=new Te(d);return R.repeat.set(.5-2*E,_-2*g),R.offset.set(E,1-g),Object.assign(R,{colorSpace:Me,wrapS:Ft,wrapT:Ft,userData:{offsetX:E,offsetY:g,cellHeight:_}}),R;function N(m,x,I,v,S,Y,C,U,H){if(S=S*(v/2),U!=null&&U!==""&&(F(),c.fillStyle=e.set(U).getStyle(),c.fill()),C&&C.size){const q=C.size*v/2;m+=q,x+=q,v-=C.size*v,S=Math.max(0,S-q),F(),c.strokeStyle=e.set(C.color).getStyle(),c.lineWidth=C.size*v,c.stroke()}Y&&z(c,m+v/2,x+(v+I)/2,Y,e.set(H).getStyle());function F(){c.beginPath(),c.moveTo(m+S,x),c.lineTo(m+v-S,x),c.arcTo(m+v,x,m+v,x+S,S),c.lineTo(m+v,x+v-S),c.arcTo(m+v,x+v,m+v-S,x+v,S),c.lineTo(m+S,x+v),c.arcTo(m,x+v,m,x+v-S,S),c.lineTo(m,x+S),c.arcTo(m,x,m+S,x,S),c.closePath()}}function tt(m,x,I){const v=[...m].sort((nt,be)=>{var It,Ht;return(((It=nt.label)==null?void 0:It.length)||0)-(((Ht=be.label)==null?void 0:Ht.length)||0)}).pop().label,{family:S,weight:Y}=I,C=s?Math.sqrt(Math.pow(x*.7,2)/2):x;let U=C,H=0,F=0;do{c.font=`${Y} ${U}px ${S}`;const nt=c.measureText(v);H=nt.width,F=nt.fontBoundingBoxDescent,U--}while(H>C&&U>0);const q=C/F,ye=Math.min(C/H,q),ge=Math.floor(U*ye);return[`${Y} ${ge}px ${S}`,q]}function z(m,x,I,v,S){m.font=p,m.textAlign="center",m.textBaseline="middle",m.fillStyle=S,m.fillText(v,x,I+(s?f:0))}},Ke=(o,t)=>o.offset.x=(t?.5:0)+o.userData.offsetX,jt=(o,t)=>{const{offset:e,userData:{offsetY:i,cellHeight:s}}=o;e.y=1-(t+1)*s+i};function kt(o,t,e=2,i=2){const s=e/2-o,n=i/2-o,r=o/e,l=(e-o)/e,h=o/i,u=(i-o)/i,a=[s,n,0,-s,n,0,-s,-n,0,s,-n,0],d=[l,u,r,u,r,h,l,h],c=[3*(t+1)+3,3*(t+1)+4,t+4,t+5,2*(t+1)+4,2,1,2*(t+1)+3,3,4*(t+1)+3,4,0],p=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11].map(z=>c[z]);let f,P,E,g,_,R,N,tt;for(let z=0;z<4;z++){g=z<1||z>2?s:-s,_=z<2?n:-n,R=z<1||z>2?l:r,N=z<2?u:h;for(let m=0;m<=t;m++)f=Math.PI/2*(z+m/t),P=Math.cos(f),E=Math.sin(f),a.push(g+o*P,_+o*E,0),d.push(R+r*P,N+h*E),m<t&&(tt=(t+1)*z+m+4,p.push(z,tt,tt+1))}return new he().setIndex(new ut(new Uint32Array(p),1)).setAttribute("position",new ut(new Float32Array(a),3)).setAttribute("uv",new ut(new Float32Array(d),2))}const Ve=(o,t)=>{const e=new w,{isSphere:i,radius:s,smoothness:n}=o,r=kt(s,n);return ot.map((l,h)=>{const u=h<3,a=ot[h],d=h?t.clone():t;jt(d,h);const{enabled:c,scale:p,opacity:f,hover:P}=o[a],E={map:d,opacity:f,transparent:!0},g=i?new Ot(new Ct(E)):new Q(r,new _t(E)),_=u?a:a[1];return g.position[_]=(u?1:-1)*(i?pe:1),i||g.lookAt(e.copy(g.position).multiplyScalar(1.7)),g.scale.setScalar(p),g.renderOrder=1,g.visible=c,g.userData={scale:p,opacity:f,hover:P},g})},$e=(o,t)=>{const{isSphere:e,corners:i}=o;if(!i.enabled)return[];const{color:s,opacity:n,scale:r,radius:l,smoothness:h,hover:u}=i,a=e?null:kt(l,h),d={transparent:!0,opacity:n},c=[1,1,1,-1,1,1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,-1,-1,-1,-1,-1].map(f=>f*.85),p=new w;return Array(c.length/3).fill(0).map((f,P)=>{if(e){const _=t.clone();jt(_,6),d.map=_}else d.color=s;const E=e?new Ot(new Ct(d)):new Q(a,new _t(d)),g=P*3;return E.position.set(c[g],c[g+1],c[g+2]),e&&E.position.normalize().multiplyScalar(1.7),E.scale.setScalar(r),E.lookAt(p.copy(E.position).multiplyScalar(2)),E.renderOrder=1,E.userData={color:s,opacity:n,scale:r,hover:u},E})},Qe=(o,t,e)=>{const{isSphere:i,edges:s}=o;if(!s.enabled)return[];const{color:n,opacity:r,scale:l,hover:h,radius:u,smoothness:a}=s,d=i?null:kt(u,a,1.2,.25),c={transparent:!0,opacity:r},p=[0,1,1,0,-1,1,1,0,1,-1,0,1,0,1,-1,0,-1,-1,1,0,-1,-1,0,-1,1,1,0,1,-1,0,-1,1,0,-1,-1,0].map(E=>E*.925),f=new w,P=new w(0,1,0);return Array(p.length/3).fill(0).map((E,g)=>{if(i){const N=t.clone();jt(N,e),c.map=N}else c.color=n;const _=i?new Ot(new Ct(c)):new Q(d,new _t(c)),R=g*3;return _.position.set(p[R],p[R+1],p[R+2]),i&&_.position.normalize().multiplyScalar(1.7),_.scale.setScalar(l),_.up.copy(P),_.lookAt(f.copy(_.position).multiplyScalar(2)),!i&&!_.position.y&&(_.rotation.z=Math.PI/2),_.renderOrder=1,_.userData={color:n,opacity:r,scale:l,hover:h},_})};function Je(o,t=!1){const e=o[0].index!==null,i=new Set(Object.keys(o[0].attributes)),s=new Set(Object.keys(o[0].morphAttributes)),n={},r={},l=o[0].morphTargetsRelative,h=new he;let u=0;for(let a=0;a<o.length;++a){const d=o[a];let c=0;if(e!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const p in d.attributes){if(!i.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;n[p]===void 0&&(n[p]=[]),n[p].push(d.attributes[p]),c++}if(c!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". Make sure all geometries have the same number of attributes."),null;if(l!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const p in d.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+".  .morphAttributes must be consistent throughout all geometries."),null;r[p]===void 0&&(r[p]=[]),r[p].push(d.morphAttributes[p])}if(t){let p;if(e)p=d.index.count;else if(d.attributes.position!==void 0)p=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". The geometry must have either an index or a position attribute"),null;h.addGroup(u,p,a),u+=p}}if(e){let a=0;const d=[];for(let c=0;c<o.length;++c){const p=o[c].index;for(let f=0;f<p.count;++f)d.push(p.getX(f)+a);a+=o[c].attributes.position.count}h.setIndex(d)}for(const a in n){const d=Vt(n[a]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" attribute."),null;h.setAttribute(a,d)}for(const a in r){const d=r[a][0].length;if(d===0)break;h.morphAttributes=h.morphAttributes||{},h.morphAttributes[a]=[];for(let c=0;c<d;++c){const p=[];for(let P=0;P<r[a].length;++P)p.push(r[a][P][c]);const f=Vt(p);if(!f)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" morphAttribute."),null;h.morphAttributes[a].push(f)}}return h}function Vt(o){let t,e,i,s=-1,n=0;for(let u=0;u<o.length;++u){const a=o[u];if(t===void 0&&(t=a.array.constructor),t!==a.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=a.itemSize),e!==a.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=a.normalized),i!==a.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=a.gpuType),s!==a.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;n+=a.count*e}const r=new t(n),l=new ut(r,e,i);let h=0;for(let u=0;u<o.length;++u){const a=o[u];if(a.isInterleavedBufferAttribute){const d=h/e;for(let c=0,p=a.count;c<p;c++)for(let f=0;f<e;f++){const P=a.getComponent(c,f);l.setComponent(c+d,f,P)}}else r.set(a.array,h);h+=a.count*e}return s!==void 0&&(l.gpuType=s),l}const ti=(o,t)=>{const{isSphere:e,background:{enabled:i,color:s,opacity:n,hover:r}}=t;let l;const h=new _t({color:s,side:Ae,opacity:n,transparent:!0,depthWrite:!1});if(!i)return null;if(e)l=new Q(new De(1.8,64,64),h);else{let u;o.forEach(a=>{const d=a.scale.x;a.scale.setScalar(.9),a.updateMatrix();const c=a.geometry.clone();c.applyMatrix4(a.matrix),u=u?Je([u,c]):c,a.scale.setScalar(d)}),l=new Q(u,h)}return l.userData={color:s,opacity:n,hover:r},l},$t=new zt,at=new w;class me extends Le{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const t=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],e=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new Yt(t,3)),this.setAttribute("uv",new Yt(e,2))}applyMatrix4(t){const e=this.attributes.instanceStart,i=this.attributes.instanceEnd;return e!==void 0&&(e.applyMatrix4(t),i.applyMatrix4(t),e.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(t){let e;t instanceof Float32Array?e=t:Array.isArray(t)&&(e=new Float32Array(t));const i=new xt(e,6,1);return this.setAttribute("instanceStart",new K(i,3,0)),this.setAttribute("instanceEnd",new K(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(t){let e;t instanceof Float32Array?e=t:Array.isArray(t)&&(e=new Float32Array(t));const i=new xt(e,6,1);return this.setAttribute("instanceColorStart",new K(i,3,0)),this.setAttribute("instanceColorEnd",new K(i,3,3)),this}fromWireframeGeometry(t){return this.setPositions(t.attributes.position.array),this}fromEdgesGeometry(t){return this.setPositions(t.attributes.position.array),this}fromMesh(t){return this.fromWireframeGeometry(new ze(t.geometry)),this}fromLineSegments(t){const e=t.geometry;return this.setPositions(e.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new zt);const t=this.attributes.instanceStart,e=this.attributes.instanceEnd;t!==void 0&&e!==void 0&&(this.boundingBox.setFromBufferAttribute(t),$t.setFromBufferAttribute(e),this.boundingBox.union($t))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new le),this.boundingBox===null&&this.computeBoundingBox();const t=this.attributes.instanceStart,e=this.attributes.instanceEnd;if(t!==void 0&&e!==void 0){const i=this.boundingSphere.center;this.boundingBox.getCenter(i);let s=0;for(let n=0,r=t.count;n<r;n++)at.fromBufferAttribute(t,n),s=Math.max(s,i.distanceToSquared(at)),at.fromBufferAttribute(e,n),s=Math.max(s,i.distanceToSquared(at));this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(t){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(t)}}ct.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new L(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};dt.line={uniforms:ae.merge([ct.common,ct.fog,ct.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class Bt extends ft{constructor(t){super({type:"LineMaterial",uniforms:ae.clone(dt.line.uniforms),vertexShader:dt.line.vertexShader,fragmentShader:dt.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(t)}get color(){return this.uniforms.diffuse.value}set color(t){this.uniforms.diffuse.value=t}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(t){t===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(t){this.uniforms.linewidth&&(this.uniforms.linewidth.value=t)}get dashed(){return"USE_DASH"in this.defines}set dashed(t){t===!0!==this.dashed&&(this.needsUpdate=!0),t===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(t){this.uniforms.dashScale.value=t}get dashSize(){return this.uniforms.dashSize.value}set dashSize(t){this.uniforms.dashSize.value=t}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(t){this.uniforms.dashOffset.value=t}get gapSize(){return this.uniforms.gapSize.value}set gapSize(t){this.uniforms.gapSize.value=t}get opacity(){return this.uniforms.opacity.value}set opacity(t){this.uniforms&&(this.uniforms.opacity.value=t)}get resolution(){return this.uniforms.resolution.value}set resolution(t){this.uniforms.resolution.value.copy(t)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(t){this.defines&&(t===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),t===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const gt=new J,Qt=new w,Jt=new w,M=new J,A=new J,j=new J,bt=new w,wt=new re,D=new ve,te=new w,rt=new zt,lt=new le,k=new J;let B,Z;function ee(o,t,e){return k.set(0,0,-t,1).applyMatrix4(o.projectionMatrix),k.multiplyScalar(1/k.w),k.x=Z/e.width,k.y=Z/e.height,k.applyMatrix4(o.projectionMatrixInverse),k.multiplyScalar(1/k.w),Math.abs(Math.max(k.x,k.y))}function ei(o,t){const e=o.matrixWorld,i=o.geometry,s=i.attributes.instanceStart,n=i.attributes.instanceEnd,r=Math.min(i.instanceCount,s.count);for(let l=0,h=r;l<h;l++){D.start.fromBufferAttribute(s,l),D.end.fromBufferAttribute(n,l),D.applyMatrix4(e);const u=new w,a=new w;B.distanceSqToSegment(D.start,D.end,a,u),a.distanceTo(u)<Z*.5&&t.push({point:a,pointOnLine:u,distance:B.origin.distanceTo(a),object:o,face:null,faceIndex:l,uv:null,uv1:null})}}function ii(o,t,e){const i=t.projectionMatrix,s=o.material.resolution,n=o.matrixWorld,r=o.geometry,l=r.attributes.instanceStart,h=r.attributes.instanceEnd,u=Math.min(r.instanceCount,l.count),a=-t.near;B.at(1,j),j.w=1,j.applyMatrix4(t.matrixWorldInverse),j.applyMatrix4(i),j.multiplyScalar(1/j.w),j.x*=s.x/2,j.y*=s.y/2,j.z=0,bt.copy(j),wt.multiplyMatrices(t.matrixWorldInverse,n);for(let d=0,c=u;d<c;d++){if(M.fromBufferAttribute(l,d),A.fromBufferAttribute(h,d),M.w=1,A.w=1,M.applyMatrix4(wt),A.applyMatrix4(wt),M.z>a&&A.z>a)continue;if(M.z>a){const g=M.z-A.z,_=(M.z-a)/g;M.lerp(A,_)}else if(A.z>a){const g=A.z-M.z,_=(A.z-a)/g;A.lerp(M,_)}M.applyMatrix4(i),A.applyMatrix4(i),M.multiplyScalar(1/M.w),A.multiplyScalar(1/A.w),M.x*=s.x/2,M.y*=s.y/2,A.x*=s.x/2,A.y*=s.y/2,D.start.copy(M),D.start.z=0,D.end.copy(A),D.end.z=0;const p=D.closestPointToPointParameter(bt,!0);D.at(p,te);const f=ce.lerp(M.z,A.z,p),P=f>=-1&&f<=1,E=bt.distanceTo(te)<Z*.5;if(P&&E){D.start.fromBufferAttribute(l,d),D.end.fromBufferAttribute(h,d),D.start.applyMatrix4(n),D.end.applyMatrix4(n);const g=new w,_=new w;B.distanceSqToSegment(D.start,D.end,_,g),e.push({point:_,pointOnLine:g,distance:B.origin.distanceTo(_),object:o,face:null,faceIndex:d,uv:null,uv1:null})}}}class oi extends Q{constructor(t=new me,e=new Bt({color:Math.random()*16777215})){super(t,e),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const t=this.geometry,e=t.attributes.instanceStart,i=t.attributes.instanceEnd,s=new Float32Array(2*e.count);for(let r=0,l=0,h=e.count;r<h;r++,l+=2)Qt.fromBufferAttribute(e,r),Jt.fromBufferAttribute(i,r),s[l]=l===0?0:s[l-1],s[l+1]=s[l]+Qt.distanceTo(Jt);const n=new xt(s,2,1);return t.setAttribute("instanceDistanceStart",new K(n,1,0)),t.setAttribute("instanceDistanceEnd",new K(n,1,1)),this}raycast(t,e){const i=this.material.worldUnits,s=t.camera;s===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const n=t.params.Line2!==void 0&&t.params.Line2.threshold||0;B=t.ray;const r=this.matrixWorld,l=this.geometry,h=this.material;Z=h.linewidth+n,l.boundingSphere===null&&l.computeBoundingSphere(),lt.copy(l.boundingSphere).applyMatrix4(r);let u;if(i)u=Z*.5;else{const d=Math.max(s.near,lt.distanceToPoint(B.origin));u=ee(s,d,h.resolution)}if(lt.radius+=u,B.intersectsSphere(lt)===!1)return;l.boundingBox===null&&l.computeBoundingBox(),rt.copy(l.boundingBox).applyMatrix4(r);let a;if(i)a=Z*.5;else{const d=Math.max(s.near,rt.distanceToPoint(B.origin));a=ee(s,d,h.resolution)}rt.expandByScalar(a),B.intersectsBox(rt)!==!1&&(i?ei(this,e):ii(this,s,e))}onBeforeRender(t){const e=this.material.uniforms;e&&e.resolution&&(t.getViewport(gt),this.material.uniforms.resolution.value.set(gt.z,gt.w))}}class fe extends me{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(t){const e=t.length-3,i=new Float32Array(2*e);for(let s=0;s<e;s+=3)i[2*s]=t[s],i[2*s+1]=t[s+1],i[2*s+2]=t[s+2],i[2*s+3]=t[s+3],i[2*s+4]=t[s+4],i[2*s+5]=t[s+5];return super.setPositions(i),this}setColors(t){const e=t.length-3,i=new Float32Array(2*e);for(let s=0;s<e;s+=3)i[2*s]=t[s],i[2*s+1]=t[s+1],i[2*s+2]=t[s+2],i[2*s+3]=t[s+3],i[2*s+4]=t[s+4],i[2*s+5]=t[s+5];return super.setColors(i),this}setFromPoints(t){const e=t.length-1,i=new Float32Array(6*e);for(let s=0;s<e;s++)i[6*s]=t[s].x,i[6*s+1]=t[s].y,i[6*s+2]=t[s].z||0,i[6*s+3]=t[s+1].x,i[6*s+4]=t[s+1].y,i[6*s+5]=t[s+1].z||0;return super.setPositions(i),this}fromLine(t){const e=t.geometry;return this.setPositions(e.attributes.position.array),this}}class si extends oi{constructor(t=new fe,e=new Bt({color:Math.random()*16777215})){super(t,e),this.isLine2=!0,this.type="Line2"}}const ni=o=>{const t=new st,e=[],i=[],{isSphere:s}=o;if(ot.forEach((l,h)=>{const{enabled:u,line:a,scale:d,color:c}=o[l];if(!u||!a)return;const p=h<3?1:-1,f=(s?pe-d/2:.975)*p;e.push(l.includes("x")?f:0,l.includes("y")?f:0,l.includes("z")?f:0,0,0,0);const P=t.set(c).toArray();i.push(...P,...P)}),!e.length)return null;const n=new fe().setPositions(e).setColors(i),r=new Bt({linewidth:o.lineWidth,vertexColors:!0,resolution:new L(window.innerWidth,window.innerHeight)});return new si(n,r).computeLineDistances()},ai=o=>{const{corners:t,edges:e}=o,i=[],s=Xe(o),n=Ve(o,s);i.push(...n),t.enabled&&i.push(...$e(o,s)),e.enabled&&i.push(...Qe(o,s,t.enabled?7:6));const r=ti(n,o),l=ni(o);return[i,r,l]},et=(o,t=!0)=>{const{material:e,userData:i}=o,{opacity:s,color:n,scale:r}=t?i.hover:i;o.scale.setScalar(r),e.opacity=s,e.map?Ke(e.map,t):e.color.set(n)},X=new re,ie=new Et,ri=new L,W=new w,oe=new J;class Mi extends St{constructor(t,e,i={}){super(),y(this,"enabled",!0),y(this,"camera"),y(this,"renderer"),y(this,"options"),y(this,"target",new w),y(this,"animated",!0),y(this,"speed",1),y(this,"animating",!1),y(this,"_options"),y(this,"_intersections"),y(this,"_background",null),y(this,"_viewport",[0,0,0,0]),y(this,"_originalViewport",[0,0,0,0]),y(this,"_originalScissor",[0,0,0,0]),y(this,"_scene"),y(this,"_camera"),y(this,"_container"),y(this,"_domElement"),y(this,"_domRect"),y(this,"_dragging",!1),y(this,"_distance",0),y(this,"_clock",new Oe),y(this,"_targetQuaternion",new it),y(this,"_quaternionStart",new it),y(this,"_quaternionEnd",new it),y(this,"_pointerStart",new L),y(this,"_focus",null),y(this,"_placement"),y(this,"_controls"),y(this,"_controlsListeners"),this.camera=t,this.renderer=e,this._scene=new Se().add(this),this.set(i)}get placement(){return this._placement}set placement(t){this._placement=de(this._domElement,t),this.domUpdate()}set(t={}){this.dispose(),this.options=t,this._options=qe(t),this._camera=this._options.isSphere?new Ee(-1.8,1.8,1.8,-1.8,5,10):new xe(26,1,5,10),this._camera.position.set(0,0,7);const[e,i,s]=ai(this._options);i&&this.add(i),s&&this.add(s),this.add(...e),this._background=i,this._intersections=e;const{container:n,animated:r,speed:l}=this._options;return this.animated=r,this.speed=l,this._container=n?Ie(n):document.body,this._domElement=Ne(this._options),this._domElement.onpointerdown=h=>this._onPointerDown(h),this._domElement.onpointermove=h=>this._onPointerMove(h),this._domElement.onpointerleave=()=>this._onPointerLeave(),this._container.appendChild(this._domElement),this._controls&&this.attachControls(this._controls),this.update(),this._updateOrientation(!0),this}render(){this.animating&&this._animate();const{renderer:t,_viewport:e}=this,i=t.getScissorTest(),s=t.autoClear;return t.autoClear=!1,t.setViewport(...e),i&&t.setScissor(...e),t.clear(!1,!0,!1),t.render(this._scene,this._camera),t.setViewport(...this._originalViewport),i&&t.setScissor(...this._originalScissor),t.autoClear=s,this}domUpdate(){this._domRect=this._domElement.getBoundingClientRect();const t=this.renderer,e=this._domRect,i=t.domElement.getBoundingClientRect();return this._viewport.splice(0,4,e.left-i.left,t.domElement.clientHeight-(e.top-i.top+e.height),e.width,e.height),t.getViewport(oe).toArray(this._originalViewport),t.getScissorTest()&&t.getScissor(oe).toArray(this._originalScissor),this}cameraUpdate(){return this._updateOrientation(),this}update(t=!0){return t&&this._controls&&this._controls.update(),this.domUpdate().cameraUpdate()}attachControls(t){return this.detachControls(),this.target=t.target,this._controlsListeners={start:()=>t.enabled=!1,end:()=>t.enabled=!0,change:()=>this.update(!1)},this.addEventListener("start",this._controlsListeners.start),this.addEventListener("end",this._controlsListeners.end),t.addEventListener("change",this._controlsListeners.change),this._controls=t,this}detachControls(){if(!(!this._controlsListeners||!this._controls))return this.target=new w().copy(this._controls.target),this.removeEventListener("start",this._controlsListeners.start),this.removeEventListener("end",this._controlsListeners.end),this._controls.removeEventListener("change",this._controlsListeners.change),this._controlsListeners=void 0,this._controls=void 0,this}dispose(){var t;this.detachControls(),this.children.forEach(e=>{var i,s,n,r;this.remove(e);const l=e;(i=l.material)==null||i.dispose(),(n=(s=l.material)==null?void 0:s.map)==null||n.dispose(),(r=l.geometry)==null||r.dispose()}),(t=this._domElement)==null||t.remove()}_updateOrientation(t=!0){t&&(this.quaternion.copy(this.camera.quaternion).invert(),this.updateMatrixWorld()),Wt(this._options,this._intersections,this.camera)}_animate(){const{position:t,quaternion:e}=this.camera;if(t.set(0,0,1),!this.animated){t.applyQuaternion(this._quaternionEnd).multiplyScalar(this._distance).add(this.target),e.copy(this._targetQuaternion),this._updateOrientation(),this.animating=!1,this.dispatchEvent({type:"change"}),this.dispatchEvent({type:"end"});return}this._controls&&(this._controls.enabled=!1);const i=this._clock.getDelta()*Ye*this.speed;this._quaternionStart.rotateTowards(this._quaternionEnd,i),t.applyQuaternion(this._quaternionStart).multiplyScalar(this._distance).add(this.target),e.rotateTowards(this._targetQuaternion,i),this._updateOrientation(),requestAnimationFrame(()=>this.dispatchEvent({type:"change"})),this._quaternionStart.angleTo(this._quaternionEnd)<yt&&(this._controls&&(this._controls.enabled=!0),this.animating=!1,this.dispatchEvent({type:"end"}))}_setOrientation(t){const e=this.camera,i=this.target;W.copy(t).multiplyScalar(this._distance),X.setPosition(W).lookAt(W,this.position,this.up),this._targetQuaternion.setFromRotationMatrix(X),W.add(i),X.lookAt(W,i,this.up),this._quaternionEnd.setFromRotationMatrix(X),X.setPosition(e.position).lookAt(e.position,i,this.up),this._quaternionStart.setFromRotationMatrix(X),this.animating=!0,this._clock.start(),this.dispatchEvent({type:"start"})}_onPointerDown(t){if(!this.enabled)return;const e=h=>{if(!this._dragging){if(Fe(h,this._pointerStart))return;this._dragging=!0}const u=ri.set(h.clientX,h.clientY).sub(this._pointerStart).multiplyScalar(1/this._domRect.width*Math.PI),a=this.coordinateConversion(W.subVectors(this.camera.position,this.target)),d=ie.setFromVector3(a);d.theta=r-u.x,d.phi=Pt(l-u.y,yt,Math.PI-yt),this.coordinateConversion(this.camera.position.setFromSpherical(d),!0).add(this.target),this.camera.lookAt(this.target),this.quaternion.copy(this.camera.quaternion).invert(),this._updateOrientation(!1),this.dispatchEvent({type:"change"})},i=()=>{if(document.removeEventListener("pointermove",e,!1),document.removeEventListener("pointerup",i,!1),!this._dragging)return this._handleClick(t);this._focus&&(et(this._focus,!1),this._focus=null),this._dragging=!1,this.dispatchEvent({type:"end"})};if(this.animating)return;t.preventDefault(),this._pointerStart.set(t.clientX,t.clientY);const s=this.coordinateConversion(W.subVectors(this.camera.position,this.target)),n=ie.setFromVector3(s),r=n.theta,l=n.phi;this._distance=n.radius,document.addEventListener("pointermove",e,!1),document.addEventListener("pointerup",i,!1),this.dispatchEvent({type:"start"})}coordinateConversion(t,e=!1){const{x:i,y:s,z:n}=t,r=St.DEFAULT_UP;return r.x===1?e?t.set(s,n,i):t.set(n,i,s):r.z===1?e?t.set(n,i,s):t.set(s,n,i):t}_onPointerMove(t){!this.enabled||this._dragging||(this._background&&Kt(this._background,!0),this._handleHover(t))}_onPointerLeave(){!this.enabled||this._dragging||(this._background&&Kt(this._background,!1),this._focus&&et(this._focus,!1),this._domElement.style.cursor="")}_handleClick(t){const e=Xt(t,this._domRect,this._camera,this._intersections);this._focus&&(et(this._focus,!1),this._focus=null),e&&(this._setOrientation(e.object.position),this.dispatchEvent({type:"change"}))}_handleHover(t){const e=Xt(t,this._domRect,this._camera,this._intersections),i=e?.object||null;this._focus!==i&&(this._domElement.style.cursor=i?"pointer":"",this._focus&&et(this._focus,!1),(this._focus=i)?et(i,!0):Wt(this._options,this._intersections,this.camera))}}const Ai={type:"sphere",size:128,placement:"bottom-right",resolution:64,lineWidth:6,radius:1,smoothness:18,animated:!0,speed:1,background:{enabled:!0,color:16777215,opacity:0,hover:{color:16777215,opacity:.2}},font:{family:"sans-serif",weight:800},offset:{top:10,left:10,bottom:10,right:10},corners:{enabled:!0,color:16766208,opacity:1,scale:.15,radius:1,smoothness:18,hover:{color:16777215,opacity:1,scale:.2}},edges:{enabled:!1,color:16766208,opacity:.5,radius:1,smoothness:18,scale:.15,hover:{color:16777215,opacity:1,scale:.2}},x:{enabled:!0,color:16725587,opacity:1,scale:.7,labelColor:2236962,line:!0,border:{size:0,color:14540253},hover:{color:16777215,labelColor:2236962,opacity:1,scale:.7,border:{size:0,color:14540253}},label:"X"},y:{enabled:!0,color:9100032,opacity:1,scale:.7,labelColor:2236962,line:!0,border:{size:0,color:14540253},hover:{color:16777215,labelColor:2236962,opacity:1,scale:.7,border:{size:0,color:14540253}},label:"Y"},z:{enabled:!0,color:2920447,opacity:1,scale:.7,labelColor:2236962,line:!0,border:{size:0,color:14540253},hover:{color:16777215,labelColor:2236962,opacity:1,scale:.7,border:{size:0,color:14540253}},label:"Z"},nx:{line:!1,scale:.45,hover:{scale:.5,color:16777215,labelColor:2236962,opacity:1,border:{size:0,color:14540253}},label:"",enabled:!0,color:16725587,opacity:1,labelColor:2236962,border:{size:0,color:14540253}},ny:{line:!1,scale:.45,hover:{scale:.5,color:16777215,labelColor:2236962,opacity:1,border:{size:0,color:14540253}},label:"",enabled:!0,color:9100032,opacity:1,labelColor:2236962,border:{size:0,color:14540253}},nz:{line:!1,scale:.45,hover:{scale:.5,color:16777215,labelColor:2236962,opacity:1,border:{size:0,color:14540253}},label:"",enabled:!0,color:2920447,opacity:1,labelColor:2236962,border:{size:0,color:14540253}},isSphere:!0},se={type:"change"},Nt={type:"start"},_e={type:"end"},ht=new Re,ne=new Ue,li=Math.cos(70*ce.DEG2RAD),T=new w,O=2*Math.PI,b={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},vt=1e-6;class Di extends Ce{constructor(t,e=null){super(t,e),this.state=b.NONE,this.target=new w,this.cursor=new w,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:$.ROTATE,MIDDLE:$.DOLLY,RIGHT:$.PAN},this.touches={ONE:V.ROTATE,TWO:V.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new w,this._lastQuaternion=new it,this._lastTargetPosition=new w,this._quat=new it().setFromUnitVectors(t.up,new w(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Et,this._sphericalDelta=new Et,this._scale=1,this._panOffset=new w,this._rotateStart=new L,this._rotateEnd=new L,this._rotateDelta=new L,this._panStart=new L,this._panEnd=new L,this._panDelta=new L,this._dollyStart=new L,this._dollyEnd=new L,this._dollyDelta=new L,this._dollyDirection=new w,this._mouse=new L,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=ci.bind(this),this._onPointerDown=hi.bind(this),this._onPointerUp=di.bind(this),this._onContextMenu=gi.bind(this),this._onMouseWheel=mi.bind(this),this._onKeyDown=fi.bind(this),this._onTouchStart=_i.bind(this),this._onTouchMove=yi.bind(this),this._onMouseDown=ui.bind(this),this._onMouseMove=pi.bind(this),this._interceptControlDown=bi.bind(this),this._interceptControlUp=wi.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(se),this.update(),this.state=b.NONE}update(t=null){const e=this.object.position;T.copy(e).sub(this.target),T.applyQuaternion(this._quat),this._spherical.setFromVector3(T),this.autoRotate&&this.state===b.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=O:i>Math.PI&&(i-=O),s<-Math.PI?s+=O:s>Math.PI&&(s-=O),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let n=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const r=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),n=r!=this._spherical.radius}if(T.setFromSpherical(this._spherical),T.applyQuaternion(this._quatInverse),e.copy(this.target).add(T),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let r=null;if(this.object.isPerspectiveCamera){const l=T.length();r=this._clampDistance(l*this._scale);const h=l-r;this.object.position.addScaledVector(this._dollyDirection,h),this.object.updateMatrixWorld(),n=!!h}else if(this.object.isOrthographicCamera){const l=new w(this._mouse.x,this._mouse.y,0);l.unproject(this.object);const h=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),n=h!==this.object.zoom;const u=new w(this._mouse.x,this._mouse.y,0);u.unproject(this.object),this.object.position.sub(u).add(l),this.object.updateMatrixWorld(),r=T.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;r!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(r).add(this.object.position):(ht.origin.copy(this.object.position),ht.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ht.direction))<li?this.object.lookAt(this.target):(ne.setFromNormalAndCoplanarPoint(this.object.up,this.target),ht.intersectPlane(ne,this.target))))}else if(this.object.isOrthographicCamera){const r=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),r!==this.object.zoom&&(this.object.updateProjectionMatrix(),n=!0)}return this._scale=1,this._performCursorZoom=!1,n||this._lastPosition.distanceToSquared(this.object.position)>vt||8*(1-this._lastQuaternion.dot(this.object.quaternion))>vt||this._lastTargetPosition.distanceToSquared(this.target)>vt?(this.dispatchEvent(se),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?O/60*this.autoRotateSpeed*t:O/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){T.setFromMatrixColumn(e,0),T.multiplyScalar(-t),this._panOffset.add(T)}_panUp(t,e){this.screenSpacePanning===!0?T.setFromMatrixColumn(e,1):(T.setFromMatrixColumn(e,0),T.crossVectors(this.object.up,T)),T.multiplyScalar(t),this._panOffset.add(T)}_pan(t,e){const i=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;T.copy(s).sub(this.target);let n=T.length();n*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*n/i.clientHeight,this.object.matrix),this._panUp(2*e*n/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),s=t-i.left,n=e-i.top,r=i.width,l=i.height;this._mouse.x=s/r*2-1,this._mouse.y=-(n/l)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(O*this._rotateDelta.x/e.clientHeight),this._rotateUp(O*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(O*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-O*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(O*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-O*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(i,s)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,n=Math.sqrt(i*i+s*s);this._dollyStart.set(0,n)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const i=this._getSecondPointerPosition(t),s=.5*(t.pageX+i.x),n=.5*(t.pageY+i.y);this._rotateEnd.set(s,n)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(O*this._rotateDelta.x/e.clientHeight),this._rotateUp(O*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,n=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,n),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const r=(t.pageX+e.x)*.5,l=(t.pageY+e.y)*.5;this._updateZoomParameters(r,l)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new L,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,i={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function hi(o){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(o.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(o)&&(this._addPointer(o),o.pointerType==="touch"?this._onTouchStart(o):this._onMouseDown(o)))}function ci(o){this.enabled!==!1&&(o.pointerType==="touch"?this._onTouchMove(o):this._onMouseMove(o))}function di(o){switch(this._removePointer(o),this._pointers.length){case 0:this.domElement.releasePointerCapture(o.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(_e),this.state=b.NONE;break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function ui(o){let t;switch(o.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case $.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(o),this.state=b.DOLLY;break;case $.ROTATE:if(o.ctrlKey||o.metaKey||o.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(o),this.state=b.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(o),this.state=b.ROTATE}break;case $.PAN:if(o.ctrlKey||o.metaKey||o.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(o),this.state=b.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(o),this.state=b.PAN}break;default:this.state=b.NONE}this.state!==b.NONE&&this.dispatchEvent(Nt)}function pi(o){switch(this.state){case b.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(o);break;case b.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(o);break;case b.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(o);break}}function mi(o){this.enabled===!1||this.enableZoom===!1||this.state!==b.NONE||(o.preventDefault(),this.dispatchEvent(Nt),this._handleMouseWheel(this._customWheelEvent(o)),this.dispatchEvent(_e))}function fi(o){this.enabled!==!1&&this._handleKeyDown(o)}function _i(o){switch(this._trackPointer(o),this._pointers.length){case 1:switch(this.touches.ONE){case V.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(o),this.state=b.TOUCH_ROTATE;break;case V.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(o),this.state=b.TOUCH_PAN;break;default:this.state=b.NONE}break;case 2:switch(this.touches.TWO){case V.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(o),this.state=b.TOUCH_DOLLY_PAN;break;case V.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(o),this.state=b.TOUCH_DOLLY_ROTATE;break;default:this.state=b.NONE}break;default:this.state=b.NONE}this.state!==b.NONE&&this.dispatchEvent(Nt)}function yi(o){switch(this._trackPointer(o),this.state){case b.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(o),this.update();break;case b.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(o),this.update();break;case b.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(o),this.update();break;case b.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(o),this.update();break;default:this.state=b.NONE}}function gi(o){this.enabled!==!1&&o.preventDefault()}function bi(o){o.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function wi(o){o.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}export{Di as O,Ai as V,Mi as X,Pi as a,Ti as b,xi as f,Ei as t};
