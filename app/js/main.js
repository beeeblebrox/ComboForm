window.addEventListener('load', function () {
  
  let forms = document.querySelectorAll('form');
  
  for (let form of forms) {
    form.addEventListener('submit', function(e){
      if (!inputValidation(this)) {
        e.preventDefault;
      }
    });
  }

  function inputValidation(form) {

    const rules = {
      name: /[А-Яа-яЁёa-zA-Z]{2}/,
      email: /\w+@\w+\.\w+/,
      tel: /(\+*[\d()-]){6}/g,
    }

    let inputs = form.querySelectorAll('.form__inputs');
    for (let input of inputs) {

      let pattern = input.dataset.pattern ? input.dataset.pattern : false;

      if (input.value.match(pattern) === null){
        return false;
      }
      return true;
      
    }
  }
  
});


