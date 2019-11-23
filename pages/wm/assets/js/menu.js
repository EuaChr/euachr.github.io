'use strict';
(function() {

  const menuBtn = document.querySelector('.page-nav__btn');
  let menuList = document.querySelector('.page-nav__list')

  menuBtn.addEventListener('click', function(evt) {

    if (menuBtn.classList.contains('page-nav__btn--closed')) {
      console.log(menuBtn.classList)
      menuBtn.classList.remove('page-nav__btn--closed');
      menuBtn.classList.add('page-nav__btn--opened');
      menuList.style.display = 'block';
    } else {
      menuBtn.classList.remove('page-nav__btn--opened');
      menuBtn.classList.add('page-nav__btn--closed');
      menuList.style.display = 'none';
    }
  });
})();