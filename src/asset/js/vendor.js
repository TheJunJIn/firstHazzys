import './_polyfills';
import $ from 'jquery';
import 'jquery-ui/ui/effect';
import Swiper, { Autoplay, Navigation, Pagination } from 'swiper';
import anime from 'animejs/lib/anime.es.js';
Swiper.use([Autoplay, Navigation, Pagination]);
window.jQuery = $;
window.$ = window.jQuery;
window.Swiper = Swiper;
window.anime = anime;