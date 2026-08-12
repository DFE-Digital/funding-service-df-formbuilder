var dependentComponents = $(".result-input");
const resultComponents = $(".Result");
if (dependentComponents.length > 0) {
    dependentComponents.each(function () {
        $(this).focusout(function () {
            UpdateResultComponent($(this));
        });
    });
}
function containsAnyLetter(str) {
    return /[a-zA-Z]/.test(str);
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
function UpdateResultComponent(element) {
    let resultArray = [];

    for (var index = 0; index < resultComponents.length; index++) {
        var inputEle = $(resultComponents[index]).children('input');
        resultArray.push(inputEle.attr('id'));
        if (inputEle.val() != NaN && inputEle.attr('expressionData').includes(element.attr('id'))) {
            try {
                var exp = inputEle.attr('expressionData') ?? inputEle.attr('expression');
                var prefix = inputEle.attr('prefix') ?? "";
                var suffix = inputEle.attr('suffix') ?? "";
                var precision = Number.parseInt(inputEle.attr('precision') ?? "0")
                var inputs = $(".result-input");
                let num = "";
                for (var j = 0; j < inputs.length; j++) {
                    const re = new RegExp($(inputs[j]).attr('id'), "g");
                    if (Number($(inputs[j]).val()) > 0 || ($(inputs[j]).val() !== undefined && $(inputs[j]).val() !== '' && $(inputs[j]).val() !== null)) {
                        let tempArray = $(inputs[j]).val().split('.');
                        if ($(inputs[j]).val().split('.')[1]) {
                            let removeComma = $(inputs[j]).val().split('.')[1].replace(/\,/g, '');
                            num = [tempArray[0], removeComma].join('.');
                        } else {
                            num = $(inputs[j]).val();
                        }
                        num = num.replace(/\,/g, '');
                        exp = exp.replace(re, num);
                    } else {
                        exp = exp.replace(re, '0');
                    }
                };
                var result = containsAnyLetter(exp)
                    ? math.evaluate(exp.replaceAll(/([a-zA-Z\-\>]{6,})/g, "0")).toFixed(precision)
                    : math.evaluate(exp).toFixed(precision);
                if (result === "Infinity" || result === "-Infinity" ||result === "" || result === "NaN") {
                    result = "0";
                }
                let displayResult = (prefix === "£" || prefix === "€") ? numberWithCommas(result) : result;
                if (prefix) {
                    displayResult = prefix + " " + displayResult;
                }
                if (suffix) {
                    displayResult = displayResult + " " + suffix;
                }
                $(resultComponents[index]).children('h2').html(displayResult)
                $(resultComponents[index]).children('div').html(displayResult)
                inputEle.val(result);

            }
            catch (e) {
                $(resultComponents[index]).children('h2').html('');
                $(resultComponents[index]).children('div').html('');
                continue;
            }
        }
    };
    for (var j = 0; j < resultArray.length; j++) {
        for (var index = 0; index < resultComponents.length; index++) {
            var inputEle = $(resultComponents[index]).children('input');
            var temp = $("#" + resultArray[j]).val();
            if (inputEle.val() != NaN && inputEle.attr('expression').includes(resultArray[j]) && $("#" + resultArray[j]).val() !== undefined) {
                try {
                    var exp = inputEle.attr('expressionData');
                    var prefix = inputEle.attr('prefix') ?? "";
                    var suffix = inputEle.attr('suffix') ?? "";
                    var precision = Number.parseInt(inputEle.attr('precision') ?? "0")
                    var inputs = $(".result-input");
                    for (var j = 0; j < inputs.length; j++) {
                        const re = new RegExp(resultArray[j], "g");
                        exp = exp.replace(re, $("#" + resultArray[j]).val());
                    };
                    inputEle.attr('expressionData', exp);
                    var result = math.evaluate(exp).toFixed(precision);
                    if (result === "Infinity" || result === "" || result === "NaN") {
                        result = "0";
                    }
                    let displayResult = (prefix === "£" || prefix === "€") ? numberWithCommas(result) : result;
                    if (prefix) {
                        displayResult = prefix + " " + displayResult;
                    }
                    if (suffix) {
                        displayResult = displayResult + " " + suffix;
                    }
                    $(resultComponents[index]).children('h2').html(displayResult)
                    $(resultComponents[index]).children('div').html(displayResult)
                    inputEle.val(result);

                }
                catch (e) {
                    // $(resultComponents[index]).children('h2').html('');
                }
            }
        };
    }
}