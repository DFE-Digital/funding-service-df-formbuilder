/**
 * Attaches on change listener to select fields
 * On change (or) selecting a value, it calls the selected-text API
 * Sends the component id and selected text value as json
 */
jQuery(document).ready(function () {
    $(".govuk-select").on('change', function (e) {
        const data = {
            id: e.target.id, // component id
            text: e.target.options[e.target.selectedIndex].innerText
        };
        // Parses the form ID from URL
        const pathname = window.location.pathname;
        const parsedResult = pathname.split("/");
        const formId = parsedResult[1]
        return axios.post(`/${formId}/selected-text`, data, {
            responseType: 'json',
            headers: {
                'Content-Type': 'application/json;'
            },
        });
    })
    $(".autocomplete__input").on('change', function (e) {
        if (e.target.value === "") {
            $(`#${e.target.id}-select`)[0].value = undefined;
        }
    })
});