'use strict';
(function () {
  const form = document.querySelector('.feedback__form');
  if (form) {
    const popupSuccess = document.querySelector('.popup--success');
    const popupError  = document.querySelector('.popup--error');
    const btnSuccess = popupSuccess.querySelector('button');
    const btnError = popupError.querySelector('button');

    const popup = {
      show: {
        success: function () {
          popupSuccess.style.display = 'flex';
          btnSuccess.addEventListener('click', popup.handler.onSuccessBtn)
        },
        error: function () {
          popupError.style.display = 'flex';
          btnError.addEventListener('click', popup.handler.onSuccessBtn)
        }
      },
      hide: {
        success: function () {
          popupSuccess.style.display = 'none';
          btnSuccess.removeEventListener('click', popup.handler.onSuccessBtn)
        },
        error: function () {
          popupError.style.display = 'none';
          btnError.removeEventListener('click', popup.handler.onSuccessBtn)
        }
      },
      handler: {
        onSuccessBtn: function () {
          popup.hide.success();
        },
        onErrorBtn: function () {
          popup.hide.error();
        }
      }
    };

    const onLoad = function () {
      return popup.show.success();
    };

    const onError = function () {
     return popup.show.error();
    };

    const sendData = function(data, OnLoad, onError) {
     const url = 'https://echo.htmlacademy.ru';
   
     const xhr = new XMLHttpRequest();

      xhr.addEventListener('load', function() {
        if (xhr.status === 200) {
          onLoad(xhr.response);
          console.log(xhr);
        } else {
          onError(xhr);
        }
      });
      xhr.open('POST', url);
      xhr.send(data);
    };

    form.addEventListener('submit', function(evt) {
      evt.preventDefault();
      const dataForm = new FormData(form);

      console.log(dataForm);
      sendData(dataForm, onLoad, onError);
      form.reset();
    });
  };
    
})();
'use strict';
(function () {
  const gallery = document.querySelector('.gallery__list');
  if ( gallery) {
    gallery.addEventListener('click', function (evt) {

        let btn = evt.target.closest('.gallery__btn');
        let wrapper = evt.target.closest('.gallery__like');
        let counter = wrapper.querySelector('.gallery__counter');
        let counterNumber = counter.textContent;

        if (btn) {
        if (wrapper.classList.contains('gallery__like--clicked')) {
          counter.textContent = counterNumber - 1;
        } else {
          counter.textContent = +counterNumber + 1;
        }
        wrapper.classList.toggle('gallery__like--clicked');
      }
    });
  }

  
})();
'use strict';
(function () {
  
  const header = document.querySelector('.main-header');

  const nav = header.querySelector('.main-nav__list');
  const btnOpen = header.querySelector('.main-nav__btn--open');
  const btnClose = header.querySelector('.main-nav__btn--close');
  const tabletWidth = 768;
  let deviceWidth;
  
  header.classList.remove('no-js');
  // btnOpen.style.display = 'block';
  // btnClose.style.display = 'block';

  const navMode = {
    showFlex: function () {
      nav.style.display = 'flex';
      btnClose.addEventListener('click', btnHandler.onBtnClose);
    },

    showBlock: function () {
      nav.style.display = 'block';
      btnClose.addEventListener('click', btnHandler.onBtnClose);
    },

    hide: function () {
      nav.style.display = 'none';
      btnOpen.addEventListener('click', btnHandler.onBtnOpen);
    }
  };

  const btnHandler = {
    onBtnOpen: function() {
      navMode.showBlock();
      btnClose.addEventListener('click', btnHandler.onBtnClose);
      btnOpen.removeEventListener('click', btnHandler.onBtnOpen);
      btnOpen.classList.add('disabled');
    },
    onBtnClose: function() {
      navMode.hide();
      btnClose.removeEventListener('click', btnHandler.onBtnClose);
      btnOpen.addEventListener('click', btnHandler.onBtnOpen);
      btnOpen.classList.remove('disabled');
    },
  }

 

  function hideNav() {
    deviceWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    if (deviceWidth < tabletWidth) {
      navMode.hide();
    } 
      else if (deviceWidth >= tabletWidth) {
        navMode.showFlex();
    }
  };

  hideNav();
  window.addEventListener('resize', hideNav);

})();