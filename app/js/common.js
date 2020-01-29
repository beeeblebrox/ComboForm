$(document).ready(function(){

  $('.btn-popup').magnificPopup({
    type: 'inline',
  closeOnBgClick: false, // Отключает закрытие окна при нажатии на фон
  focus: '#callback-name',
  fixedContentPos: false
});

  //Обязательные поля
  $('.form .form__label').each(function(){//Перебираем все label
    var ths = this,
        inputId = $(ths).attr('for'); //Определяем id, к которому привязан label
    if ( $('#'+inputId).attr('required') === 'required'){ //Если input имеет атрибут required
      $(ths).addClass('form__label--required'); // Присваиваем нужный класс
    }
  });

  $(".form__input[type=tel]").mask("+7 (999) 999-99-99");

  var dropArea = $('.input-file-wrap');

  dropArea.on('drag dragstart dragend dragover dragenter dragleave drop', function(){
    return false;
  });

  dropArea.on('dragover dragenter', function() {
    dropArea.addClass('input-file-wrap--dragover');
  });
  dropArea.on('dragleave', function(e) {
    dropArea.removeClass('input-file-wrap--dragover');
  });

  dropArea.on('drop', function(e) {
    dropArea.removeClass('input-file-wrap--dragover');
    e.preventDefault();
    var input = $('#callback-file');
    var files = e.originalEvent.dataTransfer.files; //Массив с загруженными файлами
    /*Проверка*/
    if ( checkFiles(files) ){ // Если все ок
      input.prop("files", files); // Помещаем файлы в input
    }
  });


  $('#callback-file').change(function() {
    var input = $(this);
    var files = this.files;
    /*Проверка*/
    if ( checkFiles(files) === false ){ //Если что-то не так
      input[0].value = ""; // Убираем файлы из input
    }
  });

  function checkFiles(files) {
    var maxFileSize = 6291456; //6 Мбайт
    var status = 0;
    $(files).each(function(index, file) {
      if ( (file.size <= maxFileSize) && ((file.type == 'image/png') || (file.type == 'image/jpeg')) ) {
        dropArea.find('.input-status').html('Файл(ы) загружен');
        status = true;
      }
      else {
        dropArea.find('.input-status').html('Выберите файл');
        status = false;
      }
    });
    return status;
  }

  // E-mail Ajax Send
  $("#callback-form").submit(function() {
    var th = $(this);
    var fd = new FormData(this);

    var btn = $('.form__button'); // Вносим кнопку отправки в переменную

    btn.attr("disabled", true); //Отключает кнопку отправки
    btn.addClass('form__button--loading'); //Отображаем иконку загрузки

    $.ajax({
      type: "POST",
        url: "mail/send.php", //Path to send.php
        contentType: false,
        processData: false,
        data: fd
      }).done(function() {

        btn.removeClass('form__button--loading'); // Убираем иконку загрузки

        $(th).find(".form__success").css('display', 'flex').hide().fadeIn(); // Показывает уведомление об отправке

        setTimeout(function() {
          $(th).find(".form__success").fadeOut(); // Через 4с скрывает уведомление
        }, 4000);

        setTimeout(function() { // Через 6 секунд после отправки
          btn.attr("disabled", false); //Включает кнопку отправки
          th.trigger("reset"); // Очищает форму
          $.magnificPopup.close(); // Закрывает окно
        }, 6000);
      });
      return false;
    });


});
