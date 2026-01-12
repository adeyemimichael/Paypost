import{n as p,Y as g,t as r,p as f,O as i,s as u}from"./property-46595502.js";typeof globalThis<"u"&&(globalThis.Request=globalThis.Request||(typeof Request<"u"?Request:void 0),globalThis.Response=globalThis.Response||(typeof Response<"u"?Response:void 0),globalThis.Headers=globalThis.Headers||(typeof Headers<"u"?Headers:void 0),globalThis.fetch=globalThis.fetch||(typeof fetch<"u"?fetch:void 0));var c=Object.defineProperty,y=Object.getOwnPropertyDescriptor,o=(a,l,h,s)=>{for(var t=s>1?void 0:s?y(l,h):l,n=a.length-1,d;n>=0;n--)(d=a[n])&&(t=(s?d(l,h,t):d(t))||t);return s&&t&&c(l,h,t),t};let e=class extends p{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var a;return g`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${e.weightsMap.get((a=this.weight)!=null?a:"regular")}
    </svg>`}};e.weightsMap=new Map([["thin",r`<path d="M226.83,74.83l-128,128a4,4,0,0,1-5.66,0l-56-56a4,4,0,0,1,5.66-5.66L96,194.34,221.17,69.17a4,4,0,1,1,5.66,5.66Z"/>`],["light",r`<path d="M228.24,76.24l-128,128a6,6,0,0,1-8.48,0l-56-56a6,6,0,0,1,8.48-8.48L96,191.51,219.76,67.76a6,6,0,0,1,8.48,8.48Z"/>`],["regular",r`<path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>`],["bold",r`<path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"/>`],["fill",r`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM205.66,85.66l-96,96a8,8,0,0,1-11.32,0l-40-40a8,8,0,0,1,11.32-11.32L104,164.69l90.34-90.35a8,8,0,0,1,11.32,11.32Z"/>`],["duotone",r`<path d="M232,56V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Z" opacity="0.2"/><path d="M205.66,85.66l-96,96a8,8,0,0,1-11.32,0l-40-40a8,8,0,0,1,11.32-11.32L104,164.69l90.34-90.35a8,8,0,0,1,11.32,11.32Z"/>`]]);e.styles=f`
    :host {
      display: contents;
    }
  `;o([i({type:String,reflect:!0})],e.prototype,"size",2);o([i({type:String,reflect:!0})],e.prototype,"weight",2);o([i({type:String,reflect:!0})],e.prototype,"color",2);o([i({type:Boolean,reflect:!0})],e.prototype,"mirrored",2);e=o([u("ph-check")],e);export{e as PhCheck};
