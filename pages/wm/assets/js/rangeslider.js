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