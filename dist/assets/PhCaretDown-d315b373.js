import{n as p,Y as g,t as l,p as f,O as a,s as u}from"./property-46595502.js";typeof globalThis<"u"&&(globalThis.Request=globalThis.Request||(typeof Request<"u"?Request:void 0),globalThis.Response=globalThis.Response||(typeof Response<"u"?Response:void 0),globalThis.Headers=globalThis.Headers||(typeof Headers<"u"?Headers:void 0),globalThis.fetch=globalThis.fetch||(typeof fetch<"u"?fetch:void 0));var c=Object.defineProperty,y=Object.getOwnPropertyDescriptor,r=(o,s,n,i)=>{for(var t=i>1?void 0:i?y(s,n):s,h=o.length-1,d;h>=0;h--)(d=o[h])&&(t=(i?d(s,n,t):d(t))||t);return i&&t&&c(s,n,t),t};let e=class extends p{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var o;return g`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${e.weightsMap.get((o=this.weight)!=null?o:"regular")}
    </svg>`}};e.weightsMap=new Map([["thin",l`<path d="M210.83,98.83l-80,80a4,4,0,0,1-5.66,0l-80-80a4,4,0,0,1,5.66-5.66L128,170.34l77.17-77.17a4,4,0,1,1,5.66,5.66Z"/>`],["light",l`<path d="M212.24,100.24l-80,80a6,6,0,0,1-8.48,0l-80-80a6,6,0,0,1,8.48-8.48L128,167.51l75.76-75.75a6,6,0,0,1,8.48,8.48Z"/>`],["regular",l`<path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>`],["bold",l`<path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z"/>`],["fill",l`<path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,48,88H208a8,8,0,0,1,5.66,13.66Z"/>`],["duotone",l`<path d="M208,96l-80,80L48,96Z" opacity="0.2"/><path d="M215.39,92.94A8,8,0,0,0,208,88H48a8,8,0,0,0-5.66,13.66l80,80a8,8,0,0,0,11.32,0l80-80A8,8,0,0,0,215.39,92.94ZM128,164.69,67.31,104H188.69Z"/>`]]);e.styles=f`
    :host {
      display: contents;
    }
  `;r([a({type:String,reflect:!0})],e.prototype,"size",2);r([a({type:String,reflect:!0})],e.prototype,"weight",2);r([a({type:String,reflect:!0})],e.prototype,"color",2);r([a({type:Boolean,reflect:!0})],e.prototype,"mirrored",2);e=r([u("ph-caret-down")],e);export{e as PhCaretDown};
