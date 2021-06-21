import variables from '../../asset/css/_variables.scss';
import UIModule from '../ui-module';

const defaults = {};
export default class ViewType extends UIModule {
  constructor(params = {}) {
    super({ ...defaults, ...params });
    this.viewType = null;
    ['load', 'resizeEnd'].forEach((message) => {
      this.listen(message, () => {
        this.setViewType();
      });
    });
    this.setViewType();
  }
  setViewType() {
    /**
     * desktop, mobile 외 레이아웃이 있을 경우 변경
     */
    const html = document.documentElement;
    const isDesktop = window.innerWidth >= parseInt(variables.desktopWidth, 10);
    const suffixClassList = ['desktop', 'mobile'];
    const viewType = isDesktop ? suffixClassList[0] : suffixClassList[1];
    if (this.viewType != viewType) {
      suffixClassList.forEach((name) => {
        if (name !== viewType && html.classList.contains(`is-${name}`)) {
          html.classList.remove(`is-${name}`);
        } else if (
          name === viewType &&
          !html.classList.contains(`is-${name}`)
        ) {
          html.classList.add(`is-${name}`);
        }
      });
      this.changeViewType(viewType, this.viewType);
      this.viewType = viewType;
    }
  }
  changeViewType(value, oldValue) {
    this.shout('viewTypeChanged', {
      oldValue,
      value
    });
  }
  reportback() {
    this.shout('report:viewType', {
      viewType: this.viewType
    });
  }
}
