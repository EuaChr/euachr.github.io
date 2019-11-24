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
;(function() {
$('input[type="range"]').rangeslider({
    polyfill: !1,
    onSlide: function(e, t) {
      const a = document.querySelector(".rangeslider__fill")
        , r = document.querySelector(".rangeslider__handle");
      switch (t) {
      case 0:
          a.style.width = "0%",
          r.style.transform = "translate(-11px, 0)";
          break;
      case 100:
          a.style.width = "25%",
          r.style.transform = "translate(-6px, 0)";
          break;
      case 200:
          a.style.width = "50%",
          r.style.transform = "translate(0px, 0)";
          break;
      case 300:
          a.style.width = "75%",
          r.style.left = "72.5%";
          break;
      case 400:
          a.style.width = "100%",
          r.style.transform = "translate(9px, 0)";
          break;
      default:
          console.log("Нет таких значений")
      }
    }
  });
})();
(function() {
  var x, i, j, selElmnt, a, b, c;
  /* Look for any elements with the class "custom-select": */
  x = document.getElementsByClassName("custom-select");
  for (i = 0; i < x.length; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    /* For each element, create a new DIV that will act as the selected item: */
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    /* For each element, create a new DIV that will contain the option list: */
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < selElmnt.length; j++) {
      /* For each option in the original select element,
      create a new DIV that will act as an option item: */
      c = document.createElement("DIV");
      c.innerHTML = selElmnt.options[j].innerHTML;
      c.addEventListener("click", function(e) {
          /* When an item is clicked, update the original select box,
          and the selected item: */
          var y, i, k, s, h;
          s = this.parentNode.parentNode.getElementsByTagName("select")[0];
          h = this.parentNode.previousSibling;
          for (i = 0; i < s.length; i++) {
            if (s.options[i].innerHTML == this.innerHTML) {
              s.selectedIndex = i;
              h.innerHTML = this.innerHTML;
              y = this.parentNode.getElementsByClassName("same-as-selected");
              for (k = 0; k < y.length; k++) {
                y[k].removeAttribute("class");
              }
              this.setAttribute("class", "same-as-selected");
              break;
            }
          }
          h.click();
      });
      b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function(e) {
      /* When the select box is clicked, close any other select boxes,
      and open/close the current select box: */
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
    });
  }

  function closeAllSelect(elmnt) {
    /* A function that will close all select boxes in the document,
    except the current select box: */
    var x, y, i, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    for (i = 0; i < y.length; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i)
      } else {
        y[i].classList.remove("select-arrow-active");
      }
    }
    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add("select-hide");
      }
    }
  }

  /* If the user clicks anywhere outside the select box,
  then close all select boxes: */
  document.addEventListener("click", closeAllSelect);
})();