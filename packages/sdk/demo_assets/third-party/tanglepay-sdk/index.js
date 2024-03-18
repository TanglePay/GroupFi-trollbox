/**
                       * @license
                       * author: TanglePay
                       * tanglepaysdk-client.js v0.1.9
                       * Released under the Apache-2.0 license.
                       */
var iota=function(e){"use strict";function t(e,t,n,r){return new(n||(n=Promise))((function(i,o){function s(e){try{u(r.next(e))}catch(e){o(e)}}function a(e){try{u(r.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}u((r=r.apply(e,t||[])).next())}))}function n(e,t){var n,r,i,o,s={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function a(a){return function(u){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;o&&(o=0,a[0]&&(s=0)),s;)try{if(n=1,r&&(i=2&a[0]?r.return:a[0]?r.throw||((i=r.return)&&i.call(r),0):r.next)&&!(i=i.call(r,a[1])).done)return i;switch(r=0,i&&(a=[2&a[0],i.value]),a[0]){case 0:case 1:i=a;break;case 4:return s.label++,{value:a[1],done:!1};case 5:s.label++,r=a[1],a=[0];continue;case 7:a=s.ops.pop(),s.trys.pop();continue;default:if(!(i=s.trys,(i=i.length>0&&i[i.length-1])||6!==a[0]&&2!==a[0])){s=0;continue}if(3===a[0]&&(!i||a[1]>i[0]&&a[1]<i[3])){s.label=a[1];break}if(6===a[0]&&s.label<i[1]){s.label=i[1],i=a;break}if(i&&s.label<i[2]){s.label=i[2],s.ops.push(a);break}i[2]&&s.ops.pop(),s.trys.pop();continue}a=t.call(e,s)}catch(e){a=[6,e],r=0}finally{n=i=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,u])}}}function r(){}function i(){i.init.call(this)}function o(e){return void 0===e._maxListeners?i.defaultMaxListeners:e._maxListeners}function s(e,t,n,i){var s,a,u,l;if("function"!=typeof n)throw new TypeError('"listener" argument must be a function');if((a=e._events)?(a.newListener&&(e.emit("newListener",t,n.listener?n.listener:n),a=e._events),u=a[t]):(a=e._events=new r,e._eventsCount=0),u){if("function"==typeof u?u=a[t]=i?[n,u]:[u,n]:i?u.unshift(n):u.push(n),!u.warned&&(s=o(e))&&s>0&&u.length>s){u.warned=!0;var c=new Error("Possible EventEmitter memory leak detected. "+u.length+" "+t+" listeners added. Use emitter.setMaxListeners() to increase limit");c.name="MaxListenersExceededWarning",c.emitter=e,c.type=t,c.count=u.length,l=c,"function"==typeof console.warn?console.warn(l):console.log(l)}}else u=a[t]=n,++e._eventsCount;return e}function a(e,t,n){var r=!1;function i(){e.removeListener(t,i),r||(r=!0,n.apply(e,arguments))}return i.listener=n,i}function u(e){var t=this._events;if(t){var n=t[e];if("function"==typeof n)return 1;if(n)return n.length}return 0}function l(e,t){for(var n=new Array(t);t--;)n[t]=e[t];return n}r.prototype=Object.create(null),i.EventEmitter=i,i.usingDomains=!1,i.prototype.domain=void 0,i.prototype._events=void 0,i.prototype._maxListeners=void 0,i.defaultMaxListeners=10,i.init=function(){this.domain=null,i.usingDomains&&undefined.active,this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=new r,this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},i.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||isNaN(e))throw new TypeError('"n" argument must be a positive number');return this._maxListeners=e,this},i.prototype.getMaxListeners=function(){return o(this)},i.prototype.emit=function(e){var t,n,r,i,o,s,a,u="error"===e;if(s=this._events)u=u&&null==s.error;else if(!u)return!1;if(a=this.domain,u){if(t=arguments[1],!a){if(t instanceof Error)throw t;var c=new Error('Uncaught, unspecified "error" event. ('+t+")");throw c.context=t,c}return t||(t=new Error('Uncaught, unspecified "error" event')),t.domainEmitter=this,t.domain=a,t.domainThrown=!1,a.emit("error",t),!1}if(!(n=s[e]))return!1;var f="function"==typeof n;switch(r=arguments.length){case 1:!function(e,t,n){if(t)e.call(n);else for(var r=e.length,i=l(e,r),o=0;o<r;++o)i[o].call(n)}(n,f,this);break;case 2:!function(e,t,n,r){if(t)e.call(n,r);else for(var i=e.length,o=l(e,i),s=0;s<i;++s)o[s].call(n,r)}(n,f,this,arguments[1]);break;case 3:!function(e,t,n,r,i){if(t)e.call(n,r,i);else for(var o=e.length,s=l(e,o),a=0;a<o;++a)s[a].call(n,r,i)}(n,f,this,arguments[1],arguments[2]);break;case 4:!function(e,t,n,r,i,o){if(t)e.call(n,r,i,o);else for(var s=e.length,a=l(e,s),u=0;u<s;++u)a[u].call(n,r,i,o)}(n,f,this,arguments[1],arguments[2],arguments[3]);break;default:for(i=new Array(r-1),o=1;o<r;o++)i[o-1]=arguments[o];!function(e,t,n,r){if(t)e.apply(n,r);else for(var i=e.length,o=l(e,i),s=0;s<i;++s)o[s].apply(n,r)}(n,f,this,i)}return!0},i.prototype.addListener=function(e,t){return s(this,e,t,!1)},i.prototype.on=i.prototype.addListener,i.prototype.prependListener=function(e,t){return s(this,e,t,!0)},i.prototype.once=function(e,t){if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');return this.on(e,a(this,e,t)),this},i.prototype.prependOnceListener=function(e,t){if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');return this.prependListener(e,a(this,e,t)),this},i.prototype.removeListener=function(e,t){var n,i,o,s,a;if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');if(!(i=this._events))return this;if(!(n=i[e]))return this;if(n===t||n.listener&&n.listener===t)0==--this._eventsCount?this._events=new r:(delete i[e],i.removeListener&&this.emit("removeListener",e,n.listener||t));else if("function"!=typeof n){for(o=-1,s=n.length;s-- >0;)if(n[s]===t||n[s].listener&&n[s].listener===t){a=n[s].listener,o=s;break}if(o<0)return this;if(1===n.length){if(n[0]=void 0,0==--this._eventsCount)return this._events=new r,this;delete i[e]}else!function(e,t){for(var n=t,r=n+1,i=e.length;r<i;n+=1,r+=1)e[n]=e[r];e.pop()}(n,o);i.removeListener&&this.emit("removeListener",e,a||t)}return this},i.prototype.off=function(e,t){return this.removeListener(e,t)},i.prototype.removeAllListeners=function(e){var t,n;if(!(n=this._events))return this;if(!n.removeListener)return 0===arguments.length?(this._events=new r,this._eventsCount=0):n[e]&&(0==--this._eventsCount?this._events=new r:delete n[e]),this;if(0===arguments.length){for(var i,o=Object.keys(n),s=0;s<o.length;++s)"removeListener"!==(i=o[s])&&this.removeAllListeners(i);return this.removeAllListeners("removeListener"),this._events=new r,this._eventsCount=0,this}if("function"==typeof(t=n[e]))this.removeListener(e,t);else if(t)do{this.removeListener(e,t[t.length-1])}while(t[0]);return this},i.prototype.listeners=function(e){var t,n=this._events;return n&&(t=n[e])?"function"==typeof t?[t.listener||t]:function(e){for(var t=new Array(e.length),n=0;n<t.length;++n)t[n]=e[n].listener||e[n];return t}(t):[]},i.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):u.call(e,t)},i.prototype.listenerCount=u,i.prototype.eventNames=function(){return this._eventsCount>0?Reflect.ownKeys(this._events):[]};var c={},f={},v=1,d=new e.WindowPostStream,h=e.JsonRpcEngine.builder().add((function(e,r){return t(void 0,void 0,void 0,(function(){return n(this,(function(t){return e.id=v++,e.version=101,e.params.cmd="injectToContent##".concat(e.params.cmd),e.params.origin=window.location.origin,e.params.id=e.id,[2,r(e)]}))}))})).add((function(e){return t(void 0,void 0,void 0,(function(){var t,r,i,o,s;return n(this,(function(n){return t=e.params,r=t.cmd,i=t.data,o=t.id,d.write(e.params),"injectToContent##iota_request"==r?(s=i.method,[2,new Promise((function(t,n){var r;f["iota_request_".concat(s,"_").concat(null!==(r=e.id)&&void 0!==r?r:0)]=function(e,r){if(200===r){if("iota_connect"===s){var i=e.address||"";c.curTanglePayAddress=i+"_"+e.nodeId;var a={1:12345678903,102:12345678901,101:12345678900};!e.chainId&&a[e.nodeId]&&(e.chainId=a[e.nodeId])}t({id:o,version:100,data:e})}else n(e)}}))]):[2,{id:e.id,version:100,data:void 0}]}))}))})).build(),p={isTanglePay:!1,tanglePayVersion:"",_events:new i,_waitReady:Promise,request:function(e){var r=e.method,i=e.params;return e.timeout,t(void 0,void 0,void 0,(function(){var e;return n(this,(function(t){switch(t.label){case 0:return p.isTanglePay?(r=["eth_sign","personal_sign"].includes(r)?"iota_sign":r,[4,h.request({params:{cmd:"iota_request",data:{method:r,params:i}}})]):(console.log("tanglepay not installed"),[2]);case 1:if((e=t.sent()).error)throw e.error;return[2,e.data]}}))}))},on:function(e,t){var n="iota_event_".concat(e);p._events.on(n,t)},onLoad:function(){y()},removeListener:function(e,t){p._events.removeListener(e,t)},removeAllListener:function(e){p._events.removeAllListeners(e)}};d.on("data",(function(e){var t=((null==e?void 0:e.cmd)||"").replace("contentToInject##",""),n=null==e?void 0:e.data,r=null==e?void 0:e.code,i=null==e?void 0:e.id;switch(t){case"getTanglePayInfo":p.tanglePayVersion=null==n?void 0:n.version;var o={isTanglePayInstalled:!0,tanglePayVersion:null==n?void 0:n.version,environment:d.isMobile?"app":"chrome"};window.dispatchEvent(new CustomEvent("iota-ready",{detail:o})),p._events.emit("iota-ready",o);break;case"iota_request":var s=f["iota_request_".concat(n.method,"_").concat(null!=i?i:0)];s&&s(n.response,r);break;case"iota_event":var a=n.method,u="iota_event_".concat(n.method),l=n.response;if("accountsChanged"===a){var v=l.address+"_"+l.nodeId;c.curTanglePayAddress!==v&&p._events.emit(u,l),c.curTanglePayAddress=v||""}else p._events.emit(u,l)}}));var m=0,y=function(){console.log("onLoad",m);var e=window.TanglePayEnv;if(!e&&++m<=10)setTimeout(y,300);else switch(console.log("onLoad for env:",e),e){case"app":case"chrome":p.isTanglePay=!0,d.isMobile="app"==e,h.request({params:{cmd:"getTanglePayInfo"}});break;default:console.log("not tanglepay");var t={isTanglePayInstalled:!1,tanglePayVersion:"",environment:"unknown"};window.dispatchEvent(new CustomEvent("iota-ready",{detail:t})),p._events.emit("iota-ready",t)}};return window.addEventListener("load",y),p}(TanglePaySdkCommon);
//# sourceMappingURL=index.js.map