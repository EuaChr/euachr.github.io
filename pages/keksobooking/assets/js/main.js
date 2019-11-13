'use strict';
(function() {
  /*
   * Служебные утилиты
   */
  
  const ESC_KEY = 27;
  const DEBOUNCE_INTERVAL = 100; //ms

  const onEscPress = function(evt, func) {
    if (evt.keyCode === ESC_KEY) func();
  };


  // Устраняет дребезг

  const debounce = function(func) {
    let lastTimeout;

    return function() {
      let args = arguments;
      if (lastTimeout) {
        window.clearTimeout(lastTimeout);
      };
      lastTimeout = window.setTimeout(function() {
        func.apply(null, args);
      }, DEBOUNCE_INTERVAL);
    }
  };

  window.util = {
    onEscPress: onEscPress,
    debounce: debounce
  };

})();
'use strict';
(function () {
  /*
   *  Работа с серверной частью: 
   *  - загрузить данные похожих объявлений
   *  - отправить данные из формы
   */

  window.backend = {
    load: function(onLoad, onError) {},
    save: function(data, OnLoad, onError) {}
  };

  window.backend.load = function(onLoad, onError) {
    const url = 'https://js.dump.academy/keksobooking/data';
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.addEventListener('load', function() {
      if(xhr.status === 200) {
        onLoad(xhr.response);
      } else {
        onError('Статус ответа: ' + xhr.status + ' ' + xhr.statusText);
      }
    });
    xhr.addEventListener('error', function() {
      onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
    });
    xhr.open('GET', url);
    xhr.send();
  };

  window.backend.save = function(data, onLoad, onError) {
    const url = 'https://js.dump.academy/keksobooking';
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.addEventListener('load', function() {
      if (xhr.status === 200) {
        onLoad(xhr.response);
      } else {
        onError(xhr);
      }
    });
    xhr.open('POST', url);
    xhr.send(data);
  };

})();


'use strict';
(function () {
  /*
   *  Загрузка массива объявлений
   */

  let ads = []; /* Массив объявлений */

  // Сохраняет загруженные с сервера данные в ads

  window.onLoad = function(data) {
    ads = data;
  }; 

  window.onError = function(errorMessage) {
   console.log('Ошибка загрузки данных: ' + errorMessage)
  };

  // Загрузка данных с сервера

  window.backend.load(window.onLoad, window.onError);


  //
  // Фильтрация похожих объявлений
  //

  // Набор значений фильтров

  const filterSet = {
    main: {
      type: '',
      priceRange: '',
      rooms: '',
      guests: ''
    },
    minor:[],
    reset: function(){}
  };

  // Конструктор поля фильтра

  const FilterField = function(selector) {
    this.selector = selector;
    this.value = '';
  };
  FilterField.prototype._setValue = function(elem) {
    this.value = elem.value;
  };
  FilterField.prototype._getElement = function() {
    return document.querySelector(this.selector);
  }
  FilterField.prototype._onValueChange = function(evt) {};


  // Фильтр: тип апартаментов

  const filterType = new FilterField('#housing-type');

  filterType._onValueChange = function(evt) {
    filterSet.main.type = evt.target.value;
    updateFilter(ads);
  };

  const filterTypeElement = filterType._getElement();
  filterSet.main.type = filterTypeElement.value;
  filterTypeElement.addEventListener('change', filterType._onValueChange);


  // Фильтр: цена

  const filterPrice = new FilterField('#housing-price');

  filterPrice._getPriceRange = function(price) {
   if (filterSet.main.priceRange === 'any') {
     return 'any';
   } else if (+price < 10000) {
      return 'low';
    } else if (+price > 50000) {
      return 'high';
    } 
    return 'middle';
  };

  filterPrice._onValueChange = function(evt) {
    filterSet.main.priceRange = evt.target.value;
    updateFilter(ads);
  };

  const filterPriceElement = filterPrice._getElement();
  filterSet.main.priceRange = filterPriceElement.value;
  filterPriceElement.addEventListener('change', filterPrice._onValueChange);


  // Фильтр - комнаты

  const filterRooms = new FilterField('#housing-rooms');
  
  filterRooms._onValueChange = function(evt) {
    const val = evt.target.value;
    filterSet.main.rooms = (val === 'any') ? 'any' : +val;
    updateFilter(ads);
  };

  const filterRoomsElement = filterRooms._getElement();
  filterSet.main.rooms = filterRoomsElement.value;
  filterRoomsElement.addEventListener('change', filterRooms._onValueChange);


  // Фильтр - гости

  const filterGuests = new FilterField('#housing-guests');
  filterGuests._onValueChange = function(evt) {
    const val = evt.target.value;
    filterSet.main.guests = (val === 'any') ? 'any' : +val;
    updateFilter(ads);
  };

  const filterGuestsElement = filterGuests._getElement();
  filterSet.main.guests = filterGuestsElement.value;
  filterGuestsElement.addEventListener('change', filterGuests._onValueChange);

  // Фильтр по features

  const featureElement = document.querySelector('.features');
  let checkedFeatures;

  const getCheckedFeatures = function() {
    checkedFeatures = featureElement.querySelectorAll('input:checked');
    filterSet.minor = [];

    if (checkedFeatures.length > 0) {
      checkedFeatures.forEach((el) => {
        filterSet.minor.push(el.value);
      });
    }
  };

  getCheckedFeatures();
  featureElement.addEventListener('change', () => {
    getCheckedFeatures();
    updateFilter(ads);
  });
 

  // Ресет значений фильтра

  filterSet.reset = function() {
    filterSet.main.type = filterTypeElement.value;
    filterSet.main.priceRange = filterPriceElement.value;
    filterSet.main.rooms = filterRoomsElement.value;
    filterSet.main.guests = filterGuestsElement.value;
    filterSet.minor = [];
  };
 

  //
  // Показ похожих объявлений: метки на карте и карточки объявлений
  //

  // Показ отсортированных меток

  const sortByFields = function(elem) {
    let isMatchToFields;
    for (let prop in filterSet.main) {
      isMatchToFields = ((filterSet.main[prop] === 'any')) ? true : (filterSet.main[prop] === elem.offer[prop]);
      if (!isMatchToFields) break;
    };
    return isMatchToFields;
  };

  const sortByFeatures = function(elem) {
    let isMatchToFeatures = true;

    for (let i = 0, len = filterSet.minor.length; i < len; i++) {
      if (len > 0) {
        isMatchToFeatures = (elem.offer.features.indexOf(filterSet.minor[i]) >= 0);
        if (!isMatchToFeatures) break;
      } 
    };
    return isMatchToFeatures;
  };

  const onChangeFilter = function() {
    window.card.delete();

    let copyAds = ads.slice();
    let sortedAds = copyAds.filter((elem) => {

      elem.offer.priceRange = filterPrice._getPriceRange(elem.offer.price);
      let isMatch;
      isMatch = sortByFields(elem);

      if (isMatch) {
        isMatch = sortByFeatures(elem);
      };
   
      return isMatch;
    });
    window.pin.render(sortedAds);
  };

  const updateFilter = window.util.debounce(onChangeFilter);

  const resetFilter = function() {
    document.querySelector('.map__filters').reset();
    filterSet.reset();
  };

  window.filter = {
    update: updateFilter,
    reset: resetFilter
  };
})();
'use strict';
(function() {
  /*
   *  Работа с картой, главной меткой на карте.
   *  Загрузка данных с сервера
   */

  const mapElement = document.querySelector('.map');
  const mainPinElement = document.querySelector('.map__pin--main');

  const map = {
    able: function() {
      mapElement.classList.remove('map--faded');
      window.filter.update();
    },
    disable: function() {
      mapElement.classList.add('map--faded');
    }
  };


  //
  // Движение главной метки по карте
  //

  const mainPin = {
    defaultPosition: {},
    size: {},
    coords: {}
  };

  mainPin.defaultPosition = {
    _left: '50%',
    _top: '375px',
    _resetPosition: function() {
      mainPinElement.style.left = mainPin.defaultPosition._left;
      mainPinElement.style.top = mainPin.defaultPosition._top;
    }
  };

  mainPin.size = {
    _width: 65,
    _height: 51,
    _tailHeight: 22,
  };

  mainPin.coords = {
    startX: '',
    startY: '',
    currentX: '',
    currentY: '',
    _constraints: {
      left: 0,
      top: 130,
      right: '',
      bottom: 630
    },
    _setX: function(x){
      if (x >= this._constraints.left && 
        x <= this._constraints.right) {
        this.currentX = x; 
      } else if (x <= this._constraints.left) {
        this.currentX = this._constraints.left;
      } else if (x >= this._constraints.right) {
        this.currentX = this._constraints.right;
      };
    },
    _setY: function(y) {
      if (y >= this._constraints.top && 
        y <= this._constraints.bottom) {
        this.currentY = y; 
      } else if (y <= this._constraints.top) {
        this.currentY = this._constraints.top;
      } else if (y >= this._constraints.bottom) {
        this.currentY = this._constraints.bottom;
      };
    },
    _rewriteStartCoords: function(evt) {
      mainPin.coords.startX = evt.clientX;
      mainPin.coords.startY = evt.clientY;
    }
  };

  // Вычисление _constraints для mainPin
  
  const bodyWidth = document.body.clientWidth
  mainPin.coords._constraints.left = Math.floor(mainPin.size._width/2); 
  mainPin.coords._constraints.right = Math.floor(bodyWidth - mainPin.size._width/2);


  //
  // Заполнение адреса в форме
  //

  const addressFieldElement = document.querySelector('#address');

  const addressField = {
    _startX: '',
    _startY:'',
    currentX: '',
    currentY: '',
    countX: function(leftPosition) { 
      return Math.floor(leftPosition + mainPin.size._width/2)
    },
    countY: function(topPosition){
      return Math.floor(topPosition + mainPin.size._height + mainPin.size._tailHeight);
    },
    setCurrent: function() {
      addressFieldElement.value = this.currentX + ', ' + this.currentY; 
    },
    setDefault: function() {
      addressFieldElement.value = this._startX + ', ' + this._startY; 
    }
  };

  addressField._startX = Math.floor(bodyWidth/2);
  addressField._startY = addressField.countY(+mainPin.defaultPosition._top.slice(0,3));

  addressField.setDefault();


  //
  // Перемещение главной метки по карте 
  //

  mainPinElement.addEventListener('mousedown', function(evt) {
    mainPin.coords._rewriteStartCoords(evt);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(moveEvt) {
    // Дельта смещения
    const shift = {
      x: mainPin.coords.startX - moveEvt.clientX,
      y: mainPin.coords.startY - moveEvt.clientY
    };

    // Новые координаты для следующего смещения
    mainPin.coords._rewriteStartCoords(moveEvt);

    // Расчет смещения mainPin
    mainPin.coords.currentX = mainPinElement.offsetLeft - shift.x;
    mainPin.coords.currentY = mainPinElement.offsetTop - shift.y;

    // Проверка на ограничение передвижения метки
    mainPin.coords._setX(mainPin.coords.currentX);
    mainPin.coords._setY(mainPin.coords.currentY);

    // Запись новых координат метки в стили элемента
    mainPinElement.style.left = mainPin.coords.currentX + 'px';
    mainPinElement.style.top = mainPin.coords.currentY + 'px';

    // Запись нового адреса в поле формы
    addressField.currentX = addressField.countX(mainPin.coords.currentX);
    addressField.currentY = addressField.countX(mainPin.coords.currentY);
    addressField.setCurrent();
  };

  function onMouseUp(upEvt) {
    upEvt.preventDefault();
    map.able();
    window.form.able();
    window.filter.update();

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };


  // Вернуть mainPin на исходную позицию
  // Перезаписать адрес в поле формы

  window.resetMainPin = function() {
      mainPin.defaultPosition._resetPosition();
      addressField.setDefault();
  };

})();
'use strict';
(function() {
 /*
  *  Отправка данных на сервер
  */


  let formElement = document.querySelector('.notice__form');
  
  window.uploadFiles = {
    avatar: '',
    photos: []
  };
  
  //
  // Добавить картинку - аватар автора объявления
  //

  const avatar = formElement.querySelector('.notice__photo img');
  const avatarDropArea = formElement.querySelector('.notice__photo .drop-zone');
  const avatarChooser = formElement.querySelector('.notice__photo input[type=file]');

  const IMG_TYPES = ['png', 'jpeg', 'jpg', 'gif'];
  const DROP_EVENTS = {
    on: ['dragenter', 'dragover'],
    out: ['dragleave', 'drop']
  };

  const dropArea = {
    highlight: function(dropAreaElement) {
      dropAreaElement.classList.add('highlight');
    },
    unhighlight: function(dropAreaElement) {
      dropAreaElement.classList.remove('highlight');
    }
  }
    const preventDefaults = function(evt){
    evt.preventDefault();
    evt.stopPropagation();
  };

  const handleAvatarDrop = function(file) {
    const isImage = checkFileFormat(file);
    if (isImage) {
      const reader = new FileReader();
      reader.addEventListener('load', function() {
        avatar.src = reader.result;
      });
      reader.readAsDataURL(file);
    }
  };

  const checkFileFormat = function(file) {
    const fileName = file.name.toLowerCase();
    return IMG_TYPES.some((el) => fileName.endsWith(el));
  };

  // Добавление аватара через input:file

  avatarChooser.addEventListener('change', function() {
    const files = avatarChooser.files;
    const file = files[0];
    window.uploadFiles.avatar = file;
    handleAvatarDrop(file);
  });

  // Добавление аватара через Drag& Drop

  for (let prop in DROP_EVENTS) {
    DROP_EVENTS[prop].forEach((eventName) => {
      avatarDropArea.addEventListener(eventName, preventDefaults);
    })
  };

  DROP_EVENTS.on.forEach((eventName) => {
    avatarDropArea.addEventListener(eventName, function() {
      dropArea.highlight(avatarDropArea);
    });
  });

  DROP_EVENTS.out.forEach((eventName) => {
    avatarDropArea.addEventListener(eventName, function() {
      dropArea.unhighlight(avatarDropArea);
    });
  });

  avatarDropArea.addEventListener('drop', function(evt) {
    const files = evt.dataTransfer.files;
    const file = files[0];
    window.uploadFiles.avatar = file;
    handleAvatarDrop(file);
  });

  //
  // Добавить фотографии апартаментов
  //

  const photoDropArea = formElement.querySelector('.form__photo-container .drop-zone');
  const photoChooser = formElement.querySelector('.form__photo-container input[type=file]');
  const photoGallery = formElement.querySelector('.form__gallery');

  const handlePhotoDrop = function(file) {
    const isImage = checkFileFormat(file);
    let img = document.createElement('img');
    
    if (isImage) {
      const reader = new FileReader();
      reader.addEventListener('load',function() {
        img.src = reader.result;
      });
      reader.readAsDataURL(file);
    }
    return img;
  };


  // Добавление фотографий через input[file]
  
  photoChooser.addEventListener('change', function(evt) {
  
    const files = photoChooser.files;
    let fragment = document.createDocumentFragment();

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      window.uploadFiles.photos.push(file);
      const img = handlePhotoDrop(file);
      fragment.appendChild(img);
    }
    photoGallery.appendChild(fragment);
  });

  // Добавление фотографий через Drag& Drop

  for (let prop in DROP_EVENTS) {
    DROP_EVENTS[prop].forEach((eventName) => {
      photoDropArea.addEventListener(eventName, preventDefaults);
    })
  };

  DROP_EVENTS.on.forEach((eventName) => {
    photoDropArea.addEventListener(eventName, function() {
      dropArea.highlight(photoDropArea);
    });
  });

  DROP_EVENTS.out.forEach((eventName) => {
    photoDropArea.addEventListener(eventName, function() {
      dropArea.unhighlight(photoDropArea);
    });
  });

  photoDropArea.addEventListener('drop', function(evt) {
    const files = evt.dataTransfer.files;
    let fragment = document.createDocumentFragment();
    Array.from(files, (elem) => {
    window.uploadFiles.photos.push(elem);
    const img = handlePhotoDrop(elem);
    fragment.appendChild(img);
  })
    photoGallery.appendChild(fragment);
  });
  
})();
'use strict';
(function() {
  /*
   *  Форма для размещения своего объявления
   */

  const formElement = document.querySelector('.notice__form');
  const fieldsets = formElement.querySelectorAll('fieldset');
  const avatarDefaultSrc = formElement.querySelector('.notice__preview img').src;
  const btnSubmit = document.querySelector('.form__submit');


  // Переключение состояния формы
 
  window.form = {
    able: function() {
      formElement.classList.remove('notice__form--disabled');
      fieldsets.forEach((val) => val.disabled = false);
    },
    disable: function() {
      formElement.classList.add('notice__form--disabled');
      fieldsets.forEach((val) => val.disabled = true);
    },
    reset: function(evt) {
      formElement.reset();

      formElement.querySelector('.notice__preview img').src = avatarDefaultSrc;
      formElement.querySelector('.form__gallery').innerHTML = '';

      window.uploadFiles.avatar = '';
      window.uploadFiles.photos = [];

      window.resetMainPin();
      window.card.delete();
      window.pin.clear();
      window.filter.reset();
    }
  };



  window.form.disable();

  // Очищать форму по клику на кнопке

  document.querySelector('.form__reset').addEventListener('click', function(evt) {
    evt.preventDefault();
    window.form.reset();
  });


  // Проверка валидности: заголовок

  const titleElement = formElement.querySelector('input#title');

  titleElement.addEventListener('invalid', function(evt) {
    if (titleElement.validity.tooShort) {
      titleElement.setCustomValidity('Минимальная длина заголовка - 30 символов');
    } else if (titleElement.validity.tooLong) {
      titleElement.setCustomValidity('Максимальная длина заголовка - 100 символов');
    } else if (titleElement.validity.valueMissing) {
      titleElement.setCustomValidity('Обязательное поле');
    } else {
       titleElement.setCustomValidity('');
    }
  });

  
  // Выбор и установка мин.цены на выбранный тип жилья
  
  const priceElement = formElement.querySelector('input#price');
  const minPrice = {
    apartToPrice: {
      bungalo: 0,
      flat: 1000,
      house: 5000,
      palace: 10000
    },
    set: function(val){
      priceElement.min = this.apartToPrice[val];
      priceElement.placeholder = "От " + this.apartToPrice[val];
      priceElement.title = "Цена от " + priceElement.min + ", но не более " + priceElement.max;
    }
  };
 

  // Изменить минимальную цену в зависимости от выбранного типа жилья
  // Проверка валидности поля

  const apartTypeElement = formElement.querySelector('select#type');
  apartTypeElement.addEventListener('change', function() {
    minPrice.set(apartTypeElement.value);
  });


  priceElement.addEventListener('invalid', function(evt) {
    if (priceElement.validity.badInput) {
        priceElement.setCustomValidity('Поле может содержать только цифры');
    } else if (priceElement.validity.rangeUnderflow) {
        priceElement.setCustomValidity('Минимальная цена - ' + priceElement.placeholder + ' руб');
    } else if (priceElement.validity.rangeOverflow) {
        priceElement.setCustomValidity('Максимальная цена - 1 000 000 руб');
    } else if (priceElement.validity.valueMissing) {
        priceElement.setCustomValidity('Обязательное поле');
    } else {
        priceElement.setCustomValidity('');
    }
  });


  // Время выезда/заезда зависят друг от друга

  const timeInElement = formElement.querySelector('select#timein');
  const timeOutElement = formElement.querySelector('select#timeout');

  timeInElement.addEventListener('change', function() {
    timeOutElement.value = timeInElement.value;
  });

  timeOutElement.addEventListener('change', function() {
    timeInElement.value = timeOutElement.value;
  });


  // Показать кол-во гостей на выбранное кол-во комнат

  let capacityElement = formElement.querySelector('select#capacity');
  let capasityOptionElements = capacityElement.querySelectorAll('option');

  let roomNumberElement = formElement.querySelector('select#room_number');
  let roomNumberToPersonQty = {
   '1': ['1'],
   '2': ['2', '1'],
   '3': ['3', '2', '1'],
   '100': ['0']
  };

  let roomNumber = roomNumberElement.value;

  const setCapasityOptionsDisabled = function() {
    capasityOptionElements.forEach(function(val) {
      val.disabled = true;
    });
  };

  const showAvailableRoomCapacity = function() {
    capasityOptionElements.forEach( (val, index) => {
      if (roomNumberToPersonQty[roomNumber].indexOf(val.value) >= 0) {
        capasityOptionElements[index].disabled = false;
      }
    })
  };


  // При первой загрузке:
  // - делаем все опции кол-ва гостей disabled
  // - показываем доступные варианты для указанного количества комнат
  // - первый доступный вариант кол-ва гостей делаем selected

  setCapasityOptionsDisabled();
  showAvailableRoomCapacity(roomNumber);
  capacityElement.querySelector('option:enabled').selected = true;


  // Остлеживаем изменение количества комнат

  roomNumberElement.addEventListener('change', function() {
    roomNumber = roomNumberElement.value;

    setCapasityOptionsDisabled();
    showAvailableRoomCapacity();
    
    // Сделать selected первую доступную опцию для выбранного количества комнат
    capacityElement.querySelector('option:enabled').selected = true;
  });

  //
  // Модальное окно с сообщением
  //

  const modalElement = document.querySelector('.modal');
  const modalTitle = document.querySelector('.modal__title');
  const modalButton = document.querySelector('.modal__button');

  const ESC_KEY = 27;

  const Messages = {
    success: 'Данные успешно отправлены',
    fail: 'При отправке данных произошла ошибка. Возможно, вы неправильно ввели данные.'
  }

  const modal = {
    show: function(block,button) {
      modalElement.classList.remove('hidden');
      modalButton.addEventListener('click', modal.hide);
      document.addEventListener('click', modal.onClickOut);
      document.addEventListener('keydown', modal.onEscPress);
    },
    hide: function() {
      modalElement.classList.add('hidden');
      modalButton.removeEventListener('click', modal.hide);
      document.removeEventListener('keydown', modal.onEscPress);
      document.removeEventListener('click', modal.onClickOut);
    },
    onEscPress: function(evt) {
      if (evt.keyCode === ESC_KEY) {
        modal.hide();
      }
    },
    onClickOut: function(evt) {
      const popup = document.querySelector('.modal__content');
        if (!popup.contains(evt.target)) {
          modal.hide();
        }
    }
  };

  //
  // Отправка данных на сервер
  //

  formElement.addEventListener('submit', function(evt) {
    evt.preventDefault();

    const dataForm = new FormData(formElement);
    dataForm.append('avatar', window.uploadFiles.avatar);
    window.uploadFiles.photos.forEach((el) => dataForm.append('photo', el));

    window.backend.save(dataForm, function(response) {
      window.form.reset();
      modalTitle.textContent = Messages.success;
      modal.show();
    }, function(xhr) {
        modalTitle.textContent = Messages.fail;
        modal.show();
        console.log('Ошибка отправки формы. Статус ответа: ' + xhr.status + ' - ' + xhr.statusText);
    });
  });

})()


'use strict';
(function() {
  /*
   *  Рендер метки объявления на карте
   */

  const similar = document.querySelector('.map__similar-pins');
  const template = document.querySelector('template');
  const templatePin = template.content.querySelector('.map__pin');

  const renderPinElement = function(pinData) {
    const pin = templatePin.cloneNode(true);

    pin.style.left = pinData.location.x + 'px';
    pin.style.top = pinData.location.y + 'px';
    pin.querySelector('img').src = 'assets/' + pinData.author.avatar;
    pin.querySelector('img').alt = pinData.offer.title;

    pin.addEventListener('click', function (evt) {
      window.card.show(evt, pinData);
    })
    return pin;
  };

  window.pin = {
    render: function(data) {
      similar.innerHTML = '';

      const fragment = document.createDocumentFragment();
      const pinQuantity = data.length > 5 ? 5 : data.length;

      for (let i = 0; i < pinQuantity; i++) {
        fragment.appendChild(renderPinElement(data[i]));
      }
      similar.appendChild(fragment);
    },
    clear: function() {
      similar.innerHTML = '';
    }
  };
  
})();



'use strict';
(function() {
  /*
   *  Карточки объявления для выбранной метки на карте
   */
  
  const map = document.querySelector('.map');
  const filtersContainer = document.querySelector('.map__filters-container');

  const templateCard = document.querySelector('template').content.querySelector('.map__card');
 
  const typeApartToName = {
    flat: 'Квартира',
    bungalo: 'Бунгало',
    house: 'Дом',
    palace: 'Дворец'
  };

  const featureClassMap = {
    wifi: '.feature--wifi',
    dishwasher: '.feature--dishwasher',
    parking: '.feature--parking',
    washer: '.feature--washer',
    elevator: '.feature--elevator',
    conditioner: '.feature--conditioner'
  };

  const getFeaturesUnavailable = function(card) {
    const keys = Object.keys(featureClassMap);

    const arr = keys.filter(function(i) {
      return card.offer.features.indexOf(i) < 0;
    })
    return arr;
  };

  const makeElement = function(arr){
    let fragment = document.createDocumentFragment();
    arr.forEach(function(el) {
      let newLi = document.createElement('li');
      let newImg = document.createElement('img');
      newImg.src = el;
      newLi.appendChild(newImg);
      fragment.appendChild(newLi);
    });
    return fragment;
  };

  const renderCardElement = function(card) {
    let cardElement = templateCard.cloneNode(true);
    cardElement.querySelector('.popup__title').textContent = card.offer.title;
    cardElement.querySelector('.popup__text--address').textContent = card.offer.address;
    cardElement.querySelector('.popup__price').textContent = card.offer.price + " \u20BD/ночь";
    cardElement.querySelector('.popup__type').textContent = typeApartToName[card.offer.type];
    cardElement.querySelector('.popup__text--capacity').textContent = card.offer.rooms + " комнаты для " + card.offer.guests;
    cardElement.querySelector('.popup__text--time').textContent = "Заезд после " + card.offer.checkin + ", выезд до  " + card.offer.checkout;
    getFeaturesUnavailable(card).forEach( el => {
      cardElement.querySelector(featureClassMap[el]).style.display = 'none';
    });
    cardElement.querySelector('.popup__description').textContent = card.offer.description;
    cardElement.querySelector('.popup__avatar').src = 'assets/' + card.author.avatar;
    cardElement.querySelector('.popup__pictures').appendChild(makeElement(card.offer.photos));
    return cardElement;
 };

  let cardCloseElement;
  let card;
  let chosenPin;

  const deleteCard = function() {
    if (card) {
      map.removeChild(card);
      document.removeEventListener('keydown', onEscPress);
      cardCloseElement.removeEventListener('click', deleteCard)
    }
    card = '';
  };

  const onEscPress = function(evt) {
    window.util.onEscPress(evt, deleteCard);
  };

  const renderCard = function(data) {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(renderCardElement(data));
    map.insertBefore(fragment, filtersContainer);
  };

  const showCard = function(evt, data) {
    deleteCard();
    renderCard(data);

    const target = evt.target.closest('.map__pin');
    if (chosenPin) {
      chosenPin.classList.remove('map__pin--active');
    };
    chosenPin = target;
    chosenPin.classList.add('map__pin--active');

    card = map.querySelector('.map__card');
    document.addEventListener('keydown', onEscPress);

    cardCloseElement = map.querySelector('.popup .popup__close');
    cardCloseElement.addEventListener('click', deleteCard)
  };


  window.card = {
    delete: deleteCard,
    show: showCard
  };

})();

