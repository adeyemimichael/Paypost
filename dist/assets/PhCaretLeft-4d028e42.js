import{n as p,Y as f,t as r,p as g,O as a,s as u}from"./property-46595502.js";typeof globalThis<"u"&&(globalThis.Request=globalThis.Request||(typeof Request<"u"?Request:void 0),globalThis.Response=globalThis.Response||(typeof Response<"u"?Response:void 0),globalThis.Headers=globalThis.Headers||(typeof Headers<"u"?Headers:void 0),globalThis.fetch=globalThis.fetch||(typeof fetch<"u"?fetch:void 0));var c=Object.defineProperty,y=Object.getOwnPropertyDescriptor,o=(s,l,n,i)=>{for(var t=i>1?void 0:i?y(l,n):l,h=s.length-1,d;h>=0;h--)(d=s[h])&&(t=(i?d(l,n,t):d(t))||t);return i&&t&&c(l,n,t),t};let e=class extends p{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var s;return f`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${e.weightsMap.get((s=this.weight)!=null?s:"regular")}
    </svg>`}};e.weightsMap=new Map([["thin",r`<path d="M162.83,205.17a4,4,0,0,1-5.66,5.66l-80-80a4,4,0,0,1,0-5.66l80-80a4,4,0,1,1,5.66,5.66L85.66,128Z"/>`],["light",r`<path d="M164.24,203.76a6,6,0,1,1-8.48,8.48l-80-80a6,6,0,0,1,0-8.48l80-80a6,6,0,0,1,8.48,8.48L88.49,128Z"/>`],["regular",r`<path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/>`],["bold",r`<path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z"/>`],["fill",r`<path d="M168,48V208a8,8,0,0,1-13.66,5.66l-80-80a8,8,0,0,1,0-11.32l80-80A8,8,0,0,1,168,48Z"/>`],["duotone",r`<path d="M160,48V208L80,128Z" opacity="0.2"/><path d="M163.06,40.61a8,8,0,0,0-8.72,1.73l-80,80a8,8,0,0,0,0,11.32l80,80A8,8,0,0,0,168,208V48A8,8,0,0,0,163.06,40.61ZM152,188.69,91.31,128,152,67.31Z"/>`]]);e.styles=g`
    :host {
      display: contents;
    }
  `;o([a({type:String,reflect:!0})],e.prototype,"size",2);o([a({type:String,reflect:!0})],e.prototype,"weight",2);o([a({type:String,reflect:!0})],e.prototype,"color",2);o([a({type:Boolean,reflect:!0})],e.prototype,"mirrored",2);e=o([u("ph-caret-left")],e);export{e as PhCaretLeft};
