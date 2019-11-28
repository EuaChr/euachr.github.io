'use strict';
(function () {
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.site-nav');

  function toggleMenu() {
    if (menuBtn.classList.contains('menu-btn--opened')) {
      menuBtn.classList.remove('menu-btn--opened');
      menuBtn.classList.add('menu-btn--closed');
      nav.style.display = 'none';

    } else if (menuBtn.classList.contains('menu-btn--closed')) {
      menuBtn.classList.remove('menu-btn--closed');
       menuBtn.classList.add('menu-btn--opened');
      nav.style.display = 'block';
    }
  };
  menuBtn.addEventListener('click', toggleMenu);
})();
'use strict';
(function () {
  const searchIcons = document.querySelectorAll('.page-header__btn');
  const searchForm = document.querySelector('.search-form');

  function toggleSearch(evt) {
    searchForm.classList.toggle('search-form--hidden');
  };

  for (let i = 0, length = searchIcons.length; i < length; i++) {
    searchIcons[i].addEventListener('click', toggleSearch);
  };
})();
(function() {
  const catalog = document.querySelector('.catalog__slider');
  catalog.addEventListener('click', function(evt) {
    evt.preventDefault();
    if (evt.target.classList.contains('size__btn')) {
      evt.target.classList.toggle('active');
    };
  })
})();