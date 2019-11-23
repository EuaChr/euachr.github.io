'use strict';
(function() {
  const personalInfo = document.querySelector('.form__section--name');
  const inputs = personalInfo.querySelectorAll('input');

  for (let i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('change', function () {
      if (inputs[i].value.length > 0) inputs[i].classList.add('active');
      else if(inputs[i].value.length == 0) inputs[i].classList.remove('active');
    })
  }
})();