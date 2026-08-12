var currencyComponent = $('[class^="currency-component"]');

currencyComponent
  .focusout(function() {
    const id = $(this).attr('id');
    const element = $('.currency-component-'+id);
    var value = element.val().replace(/\,/g,'');
    if (isNaN(value)){
      element.val("");
    } else {
      if(Number(value)!==0){
        const decimalsFormated = Number(value);
        let finalFormated = String(decimalsFormated).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        let tempArray = finalFormated.split('.');
        if (finalFormated.split('.')[1]) {
          let removeComma = finalFormated.split('.')[1].replace(/\,/g, '');
          finalFormated = [tempArray[0], removeComma].join('.');
        }
        element.val(finalFormated);
      }
    } 
});


$('.currency-component').keyup(function() {
  $(this).val($(this).val().replace(/[^0-9\.]/g,''));
});

// disable mousewheel on a input number field when in focus
// (to prevent Chromium browsers change the value when scrolling)
$('form').on('focus', 'input[type=number]', function (e) {
  $(this).on('wheel.disableScroll', function (e) {
    e.preventDefault()
  })
})

$('form').on('blur', 'input[type=number]', function (e) {
  $(this).off('wheel.disableScroll')
})