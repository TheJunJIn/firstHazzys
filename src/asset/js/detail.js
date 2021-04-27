const { $ } = window;

$(function () {
  $(document)
    // 리뷰상세보기 팝업 > 텍스트 더보기 버튼
    .on('click', '.review-content.is-limit .button-more', function () {
      $(this).closest('.is-limit').removeClass('is-limit');
    });
});
