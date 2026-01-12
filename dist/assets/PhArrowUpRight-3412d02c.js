import{n as d,Y as g,t as s,p as f,O as l,s as u}from"./property-46595502.js";typeof globalThis<"u"&&(globalThis.Request=globalThis.Request||(typeof Request<"u"?Request:void 0),globalThis.Response=globalThis.Response||(typeof Response<"u"?Response:void 0),globalThis.Headers=globalThis.Headers||(typeof Headers<"u"?Headers:void 0),globalThis.fetch=globalThis.fetch||(typeof fetch<"u"?fetch:void 0));var c=Object.defineProperty,y=Object.getOwnPropertyDescriptor,o=(r,i,n,a)=>{for(var t=a>1?void 0:a?y(i,n):i,h=r.length-1,p;h>=0;h--)(p=r[h])&&(t=(a?p(i,n,t):p(t))||t);return a&&t&&c(i,n,t),t};let e=class extends d{constructor(){super(...arguments),this.size="1em",this.weight="regular",this.color="currentColor",this.mirrored=!1}render(){var r;return g`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored?"scale(-1, 1)":null}
    >
      ${e.weightsMap.get((r=this.weight)!=null?r:"regular")}
    </svg>`}};e.weightsMap=new Map([["thin",s`<path d="M196,64V168a4,4,0,0,1-8,0V73.66L66.83,194.83a4,4,0,0,1-5.66-5.66L182.34,68H88a4,4,0,0,1,0-8H192A4,4,0,0,1,196,64Z"/>`],["light",s`<path d="M198,64V168a6,6,0,0,1-12,0V78.48L68.24,196.24a6,6,0,0,1-8.48-8.48L177.52,70H88a6,6,0,0,1,0-12H192A6,6,0,0,1,198,64Z"/>`],["regular",s`<path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"/>`],["bold",s`<path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z"/>`],["fill",s`<path d="M200,64V168a8,8,0,0,1-13.66,5.66L140,127.31,69.66,197.66a8,8,0,0,1-11.32-11.32L128.69,116,82.34,69.66A8,8,0,0,1,88,56H192A8,8,0,0,1,200,64Z"/>`],["duotone",s`<path d="M192,64V168L88,64Z" opacity="0.2"/><path d="M192,56H88a8,8,0,0,0-5.66,13.66L128.69,116,58.34,186.34a8,8,0,0,0,11.32,11.32L140,127.31l46.34,46.35A8,8,0,0,0,200,168V64A8,8,0,0,0,192,56Zm-8,92.69-38.34-38.34h0L107.31,72H184Z"/>`]]);e.styles=f`
    :host {
      display: contents;
    }
  `;o([l({type:String,reflect:!0})],e.prototype,"size",2);o([l({type:String,reflect:!0})],e.prototype,"weight",2);o([l({type:String,reflect:!0})],e.prototype,"color",2);o([l({type:Boolean,reflect:!0})],e.prototype,"mirrored",2);e=o([u("ph-arrow-up-right")],e);export{e as PhArrowUpRight};
