import ShoutAndListen from './_util/shout-and-listen';
import AOS from 'aos';
const sal = new ShoutAndListen('event');
// const shout = sal.shout.bind(sal);
const listen = sal.listen.bind(sal);
const report = sal.report.bind(sal);
// const { $ } = window;

AOS.init({ delay: 100, offset: 10 });
window.AOS = AOS;

const states = {
  viewType: null,
  header: {
    isHidden: false,
    height: 60,
    options: {}
  }
};

function onViewTypeChange(viewType) {
  if (typeof viewType !== 'string') {
    return;
  }
  states.viewType = viewType;
}

// listen('load', () => {
//   console.log('load');
// });
// listen('resize', () => {
//   console.log('resize');
// });
// listen('scroll', ({ scrollY }) => {
//   console.log('scroll', scrollY)
// });
listen('headerIsHidden', (value) => {
  states.header.isHidden = value;
});
listen('viewTypeChanged', ({ value }) => {
  onViewTypeChange(value);
});
report('viewType').then(({ viewType }) => {
  onViewTypeChange(viewType);
});
report('header').then((state) => {
  states.header = Object.assign({}, state);
});
