import{n as d,Y as g,t as s,p as f,O as i,s as u}from"./property-46595502.js";typeof globalThis<"u"&&(globalThis.Request=globalThis.Request||(typeof Request<"u"?Request:void 0),globalThis.Response=globalThis.Response||(typeof Response<"u"?Response:void 0),globalThis.Headers=globalThis.Headers||(typeof Headers<"u"?Headers:void 0),globalThis.fetch=globalThis.fetch||(typeof fetch<"u"?fetch:void 0));var c=Object.defineProperty,y=Object.getOwnPropertyDescriptor,r=(o,l,n,a)=>{for(var t=a>1?void 0:a?y(l,n):l,p=o.length-1,h;p>=0;p--)(h=o[p])&&(t=(a?h(l,n,t):h(t))||t);return a&&t&&c(l,n,t),t};let e=class extends d{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var o;return g`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${e.weightsMap.get((o=this.weight)!=null?o:"regular")}
    </svg>`}};e.weightsMap=new Map([["thin",s`<path d="M210.83,162.83a4,4,0,0,1-5.66,0L128,85.66,50.83,162.83a4,4,0,0,1-5.66-5.66l80-80a4,4,0,0,1,5.66,0l80,80A4,4,0,0,1,210.83,162.83Z"/>`],["light",s`<path d="M212.24,164.24a6,6,0,0,1-8.48,0L128,88.49,52.24,164.24a6,6,0,0,1-8.48-8.48l80-80a6,6,0,0,1,8.48,0l80,80A6,6,0,0,1,212.24,164.24Z"/>`],["regular",s`<path d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"/>`],["bold",s`<path d="M216.49,168.49a12,12,0,0,1-17,0L128,97,56.49,168.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0l80,80A12,12,0,0,1,216.49,168.49Z"/>`],["fill",s`<path d="M215.39,163.06A8,8,0,0,1,208,168H48a8,8,0,0,1-5.66-13.66l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,215.39,163.06Z"/>`],["duotone",s`<path d="M208,160H48l80-80Z" opacity="0.2"/><path d="M213.66,154.34l-80-80a8,8,0,0,0-11.32,0l-80,80A8,8,0,0,0,48,168H208a8,8,0,0,0,5.66-13.66ZM67.31,152,128,91.31,188.69,152Z"/>`]]);e.styles=f`
    :host {
      display: contents;
    }
  `;r([i({type:String,reflect:!0})],e.prototype,"size",2);r([i({type:String,reflect:!0})],e.prototype,"weight",2);r([i({type:String,reflect:!0})],e.prototype,"color",2);r([i({type:Boolean,reflect:!0})],e.prototype,"mirrored",2);e=r([u("ph-caret-up")],e);export{e as PhCaretUp};
