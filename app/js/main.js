window.addEventListener('load', function () {
  
  let forms = document.querySelectorAll('form');
  
  for (let form of forms) {

    form.addEventListener('input', function(e){
      if (!e.target.classList.contains('form__input')){
        return;
      }
      let input = e.target;
      inputValidation(input);
    })

    form.addEventListener('submit', function(e){

      let inputs = form.querySelectorAll('.form__input');
      
      for (let input of inputs) {
        if (!inputValidation(input)){
          e.preventDefault();
        }
      }
      
    });
  }
  
  function inputValidation(input) {
    
    const rules = {
      email: /\w+@\w+\.\w+/,
      tel: /(\+*[\d()-]){6}/g,
    }
    
    let isRequired = input.required;
    let value = input.value;
    let pattern = input.dataset.pattern;

    if (isRequired && pattern) {
      if (value.match(rules[pattern]) === null){
        input.classList.add('form__input--error');
        return false;
      }
      else {
        input.classList.remove('form__input--error');
        input.classList.add('form__input--valid');
      }
    }
    return true;
  
  }
  
});


