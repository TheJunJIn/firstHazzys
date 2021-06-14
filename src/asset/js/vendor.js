import './_polyfills';
import $ from 'jquery';
import 'jquery-ui/ui/effect';
import 'jquery-ui/ui/widgets/datepicker';
import anime from 'animejs/lib/anime.es.js';
import { Swiper, Autoplay, Navigation, Pagination, EffectFade } from 'swiper/dist/js/swiper.esm.js';
Swiper.use([Autoplay, Navigation, Pagination, EffectFade]);

window.jQuery = $;
window.$ = window.jQuery;
window.Swiper = Swiper;
window.anime = anime;