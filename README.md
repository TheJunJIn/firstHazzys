# 시작하기
## node version
- 작업시 `14.16.1` 버전 사용 ( 2021.04 기준 LTS 버전)

## 설치
- npm install

## 사용법
- 로컬 작업환경 실행 : npm start
- Production 빌드(css,js minify, image optimize 등 처리) : npm run build
- image sprite 생성 : npm run sprites

## 폴더 구조
```
- src
  - cmsstatic       // Asset 관리에서 업로드해야할 대상
    + asset
      - fonts       // 웹폰트
      - images      // 이미지
      - icons       // SVG Sprite 자동생성
  - asset
    + css           // SCSS 사용 ( _name.scss, _/path/name.scss 는 파일이 생성되지 않음 )
    + js            // JS (Webpack 으로 Bundle- _name.js, _/path/name.js 는 파일생성되지 않음)
  - guie           // 퍼블리싱 가이드 HTML
  - pages          // 마크업 HTML
    + member       // 회원관련페이지
  - components
    - sprites      // Srpite Image 자동생성
    - ...          // Header, Footer, Modal 등 공통 모듈
  - layouts        // 레이아웃
```