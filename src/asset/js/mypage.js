import AOS from 'aos';
import rangesliderJs from 'rangeslider-js'

window.AOS = AOS;
window.rangesliderJs = rangesliderJs;

AOS.init({ delay: 100, offset: 10 });
const $ = window.jQuery;

console.log('rangesliderJs', rangesliderJs);