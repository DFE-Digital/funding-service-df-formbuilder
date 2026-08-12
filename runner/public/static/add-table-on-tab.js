$(".govuk-tabs__list-item").on("click", async function (e) {
    const fileId = e.target.parentNode.getAttribute("data-file-id");
    const tableId = e.target.parentNode.getAttribute("data-table-id");
    const tabId = e.target.getAttribute("href").replace("#", "");
    // Parses the form ID from URL
    const pathname = window.location.pathname;
    const parsedResult = pathname.split("/");
    const formId = parsedResult[1]
    // Check if table is there
    const checkTable = document.querySelector(`#${tabId} > table.custom-table`);
    if (fileId && formId && !checkTable) {
        const payload = {
            fileId,
            tableId
        }
        const tableResponse = await axios.post(`/${formId}/generate-table-for-tab`, payload, {
            responseType: 'json',
            headers: {
                'Content-Type': 'application/json;'
            },
        })
        const parsedHTML = $.parseHTML(tableResponse.data)
        $(`#${tabId}`).children().after(parsedHTML) // Adds Table
    }
})
