jQuery(document).ready(async function (e) {
  //document.querySelector('#submit-form').disabled = false;
  let summaryButtons = document.querySelector(".summary-btn-group");
  let listRowBottomLine = document.querySelectorAll(".govuk-summary-list__row");
  let isPrintPDFByClick = false;
  let pdfStatus = document.querySelector(".sub-status");
  let blankPrint = document.querySelectorAll(".govuk-summary-list-blank-print");
  let currentTargetID = window.location.pathname.split("/")[1];
  let path = window.location.pathname.split("/")[2];
  let loader = $('#' + currentTargetID + '_text' + '.loadertext');
  let email = document.getElementById("email-socket-event")?.innerText;
  let emailType = document.getElementById("email-type")?.innerText;
  let notifyPDF = false;

  Array.from(blankPrint).forEach(el => el.style.display = "none");
  let summaryname = window.location.pathname.split("/");
  const summarynameTrimmed = summaryname[summaryname.length - 1];

  $('#pdf-download').click(function (e) {
    isPrintPDFByClick = true;
    if (pdfStatus) {
      pdfStatus.innerHTML = "<div class='govuk-body sub-status'>Submission Status&nbsp;:&nbsp;&nbsp;&nbsp;<b>NOT SUBMITTED</b>";
    }
     
    const body = buildPDFPayload();
    generatePDFFromAPI(body);

  });
async function generatePDFFromAPI(payload) {
    try {
        const response = await fetch('/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`PDF generation failed: ${response.status}`);
        }

        const result = await response.json();
        const pdfBase64 = result.PdfDataBase64;

        // Convert Base64 to Blob safely
        const pdfBlob = base64ToBlobSafe(pdfBase64, 'application/pdf');
        const fileName = payload.message.name ? `${payload.message.name}.pdf` : 'document.pdf';
 
        const a = document.createElement('a');
        a.href = URL.createObjectURL(pdfBlob);
        a.download = fileName;
        document.body.appendChild(a); // Required for Firefox
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);

    } catch (err) {
        console.error(err);
    }
}

function buildPDFPayload() { 
    const formName = document.querySelector('.service-navigation-component__title')?.innerText || 'Form';
    const referenceNumber = document.querySelector(".reference-number")?.innerText || '';
    const userEmail = document.getElementById("email-socket-event")?.innerText || email || '';

    const now = new Date();
    const currentTimeString =
        now.toISOString().split('T')[0] + ', ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const details = [];
    const fallbackItems = []; 

    const summaryLists = document.querySelectorAll(
        '.govuk-summary-list:not(.govuk-summary-list-print):not(.govuk-summary-list-blank-print)'
    );

    summaryLists.forEach((summaryList) => {

        let sectionTitle = '';
        let sectionName = '';

        let prev = summaryList.previousElementSibling;

        while (prev) {
            if (prev.tagName === 'H2' || prev.tagName === 'H3') {
                sectionTitle = prev.innerText.trim();
                sectionName = sectionTitle.replace(/\s+/g, '');
                break;
            }
            prev = prev.previousElementSibling;
        }
        const rows = summaryList.querySelectorAll(
        '.govuk-summary-list__row:not(.govuk-form-group-hidden)'
        );
        const itemMap = new Map();

        rows.forEach((row) => {
            const keyEl = row.querySelector('.govuk-summary-list__key');
            const valueEl = row.querySelector('.govuk-summary-list__value');
            const actionEl = row.querySelector('.govuk-summary-list__actions a');

            if (keyEl && valueEl) {
                const label = keyEl.innerText.trim();
                const value = valueEl.innerText.trim();
                const url = actionEl?.href || '';

                const uniqueKey = `${label}|${value}`;

                if (!itemMap.has(uniqueKey)) {
                    itemMap.set(uniqueKey, {
                        label: label,
                        value: value,
                        rawValue: value,
                        title: label,
                        url: url,
                        dataType: "text",
                        options: {
                            required: false
                        }
                    });
                }
            }
        });

        const items = Array.from(itemMap.values());
        if (items.length === 0) return;
        if (!sectionTitle) {           
             details.push({
                name: "",
                title: "",
                items: items
            });
        } else {           
             details.push({
                name: sectionName,
                title: sectionTitle,
                items: items
            });
        }
    });


    return {
        message: {
            pageTitle: "Summary",
            skipSummary: false,
            endPage: null,
            details: details,
            name: formName,
            referenceNumber: null,
            currentTimeString: currentTimeString,
            pdfPrintStatus: "NOT SUBMITTED",
            email: userEmail,
            outputType: []
        }
    };
}




function base64ToBlobSafe(base64, type) {
    // Remove newlines and spaces
    let cleaned = base64.replace(/\s/g, '');
    // Fix URL-safe Base64
    cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');
    // Pad string with '=' if needed
    while (cleaned.length % 4) {
        cleaned += '=';
    }

    const binary = atob(cleaned);
    const len = binary.length;
    const buffer = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        buffer[i] = binary.charCodeAt(i);
    }

    return new Blob([buffer], { type });
}
 // function printPDF() {
  //   let warningMsg = document.querySelector(".msg-for-printing");
  //   if (!isPrintPDFByClick) {
  //     if (warningMsg) warningMsg.style.display = "none";
  //   } else {
  //     if (warningMsg) warningMsg.style.display = "flex";
  //   }
  //   let popLogo = document.querySelector(".pop_logo");
  //   let popLogoImage = document.querySelector(".pop_logo_image");
  //   let formsLoader = document.querySelector(".digital-forms-loader");
  //   $('#' + currentTargetID + '.digital-forms-loader').fadeTo(200, 1);
  //   $('.upload-dialog').hide();
  //   $('.Validation-dialog').hide();
  //   $('.Validation-datavaliddialog').hide();
  //   $('.Validation-datamissdialog').hide();
  //   $('.Validation-colmissdialog').hide();
  //   $('.show-error').hide();
  //   $('.service-down').hide();
  //   $('#' + currentTargetID + '.pop').show();
  //   let loaderText = document.getElementById(currentTargetID + "_text");

  //   let loaderpopup = document.querySelector(".loaderpopup");
  //   if (formsLoader && loaderpopup) {
  //     formsLoader.style.display = "block";
  //     loaderpopup.style.display = "block";
  //   }
  //   if (!isPrintPDFByClick) {
  //     $('#_text' + '.loadertext:contains("Please wait, while the system is printing all the pages...")').text("Please wait, while the system is emailing the pdf...");
  //   }
  //   let pages;
  //   if (document.querySelectorAll('.govuk-summary-list-print') !== null) {
  //     pages = document.querySelectorAll('.govuk-summary-list-print');
  //   } else {
  //     Array.from(blankPrint).forEach(el => el.style.display = "block");
  //     pages = document.querySelectorAll(".govuk-summary-list-blank-print");
  //   }
  //   let printedSummaryContainer = document.querySelector('.printed-summary-container');
  //   let submitBtn = document.querySelector('#pdf-download');
  //   let pdfBtn = document.querySelector('#submit-form');
  //   let formName = document.querySelector('.service-navigation-component__title')?.innerText;
  //   let footerMeta = document.querySelector(".govuk-footer__meta");
  //   let footer = document.querySelector(".govuk-footer");
  //   let header = document.querySelector(".govuk-header");
  //   let mainTemplate = document.querySelector(".govuk-template");
  //   let summaryHeader = document.querySelector(".govuk-heading-xl");
  //   let formNamePrint = document.querySelector(".form-name-for-printing");

  //   let listKeyBottomLine = document.querySelectorAll(".govuk-summary-list__key");
  //   let listValueBottomLine = document.querySelectorAll(".govuk-summary-list__value");
  //   let listActionsBottomLine = document.querySelectorAll(".govuk-summary-list__actions");
  //   let cookies = document.getElementById("global-cookie-message");
  //   let referenceNumber = document.querySelector(".reference-number")?.innerText;
  //   let summarySubHeader = document.querySelector(".summary-header-hidden");
  //   let pdfStatus = document.querySelector(".sub-status");
  //   let refTime = document.querySelector(".reference-number-and-time");
  //   let govukHeadingM = document.querySelectorAll('.govuk-heading-m');
  //   let govukSummaryList = document.querySelectorAll('.govuk-summary-list');
  //   let subheaderPrint = document.querySelectorAll(".govuk-heading-m.subheader");

  //   if (pdfStatus) {
  //     Array.from(subheaderPrint).forEach(el => el.style.display = "block");
  //     if (printedSummaryContainer) {
  //       printedSummaryContainer.style.display = "block";
  //       Array.from(govukHeadingM).forEach(el => el.style.display = "none");
  //       Array.from(govukSummaryList).forEach(el => el.style.display = "none");
  //       Array.from(pages).forEach(el => el.style.opacity = 1);
  //       refTime.style.display = "flex";
  //       refTime.style.justifyContent = "space-between";
  //       Array.from(listRowBottomLine).forEach(el => el.style.borderBottom = "1px solid #b1b4b6");
  //       Array.from(listKeyBottomLine).forEach(el => el.style.borderBottom = "1px solid #b1b4b6");
  //       Array.from(listValueBottomLine).forEach(el => el.style.borderBottom = "1px solid #b1b4b6");
  //       Array.from(listActionsBottomLine).forEach(el => el.style.borderBottom = "1px solid #b1b4b6");
  //       if (cookies) cookies.style.display = "none";
  //       for (btn of $('dd')) {
  //         if (btn.getAttribute('class') === "govuk-summary-list__actions") btn.style.opacity = 0;
  //       }
  //       summaryHeader.style.display = "none";
  //       summarySubHeader.style.opacity = 1;
  //       summarySubHeader.style.marginTop = "30px";
  //       summarySubHeader.style.display = "block";
  //       submitBtn.style.display = "none";
  //       pdfBtn.style.display = "none";
  //       footer.style.display = "none";
  //       footerMeta.style.display = "none";
  //       header.style.display = "none";
  //       mainTemplate.style["background-color"] = "white";
  //       formNamePrint.style.opacity = 1;
  //     }
  //     let div = document.createElement('div');
  //     div.classList.add("divider");
  //   }
  //   let fileName = `${formName}.pdf`;

  //   const exportHTMLToPDF = async (pages, outputType = 'blob') => {
  //     // Ensure webfonts (Inter) are loaded before rendering to canvas for correct PDF font rendering.
  //     // Use the Font Loading API if available, otherwise wait a short fixed delay as a fallback.
  //     try {
  //       if (document.fonts && document.fonts.ready) {
  //         // Wait up to 5s for fonts to load, then proceed.
  //         const timeout = new Promise((res) => setTimeout(res, 5000));
  //         await Promise.race([document.fonts.ready, timeout]);
  //       } else {
  //         // Fallback: small delay to allow @imported fonts to download
  //         await new Promise((res) => setTimeout(res, 800));
  //       }
  //     } catch (err) {
  //       console.warn('Font loading wait failed or timed out:', err);
  //     }
  // // Inject temporary CSS override to enforce Arial for the summary print area
  // let overrideStyleEl = document.createElement('style');
  // overrideStyleEl.id = 'pdf-summary-font-override';
  // overrideStyleEl.type = 'text/css';
  // // include all print-related containers so their fonts are overridden during capture
  // overrideStyleEl.appendChild(document.createTextNode('#summaryprint, #summaryprint *, .printed-summary-container, .govuk-summary-list-print, .govuk-summary-row-print, .govuk-summary-list-blank-print, .form-name-for-printing, .reference-number-and-time { font-family: Arial, sans-serif !important; }'));
  // document.head.appendChild(overrideStyleEl);

  // const opt = {
  //       margin: [10, 5, 5, 5],
  //       filename: 'myfile.pdf',
  //       image: { type: 'jpeg', quality: 0.50 },
  //       html2canvas: {
  //         scale: 3,
  //         logging: true,
  //         letterRendering: true,
  //         useCORS: true,
  //         allowTaint: true,
  //         scrollX: 0,
  //         scrollY: 0,
  //         dpi: 80,
  //         width: 890,
  //         height: 1024,
  //       },
  //       pagebreak: {
  //         mode: ['avoid-all', 'css', 'legacy']
  //       },
  //       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  //     };
  //     window.jsPDF = window.jspdf.jsPDF;
  //     const doc = new window.jsPDF(opt.jsPDF);
  //     const pageSize = jsPDF.getPageSize(opt.jsPDF);

  // for (let i = 0; i < pages.length; i++) {
  //       const page = pages[i];
  //       const pageImage = await html2pdf().from(page).set(opt).outputImg();
  //       if (i != 0) {
  //         doc.addPage();
  //       }
  //       doc.addImage(pageImage.src, 'jpeg', opt.margin[0], opt.margin[1], pageSize.width, pageSize.height);
  //       doc.setPage(i + 1);
  //       doc.setFontSize(10);
  //       doc.setTextColor(100);
  //       var totalPages = doc.internal.getNumberOfPages();
  //       if (pages.length === 1) {
  //         doc.text(`${(formName).replace(/(.{30})..+/, "$1…")}                                          ${referenceNumber}                                             Page ${i + 1} of ${pages.length}`, (doc.internal.pageSize.getWidth() / 20.7698), (doc.internal.pageSize.getHeight() - 9));
  //       } else {
  //         doc.text(`${(formName).replace(/(.{30})..+/, "$1…")}                                          ${referenceNumber}                                             Page ${i + 1} of ${pages.length}`, (doc.internal.pageSize.getWidth() / 20.7698), (doc.internal.pageSize.getHeight() - 9));
  //       }
  //       formsLoader.style.display = "block";
  //       loaderpopup.style.display = "block";
  //       formsLoader.style.background = "rgba(225,225,225,1)";
  //       if (doc.output(outputType).size > 2100000 && notifyPDF) {
  //         break;
  //       }
  //     }
  //     // This can be whatever output you want. I prefer blob. 
  //     const pdf = doc.output(outputType);
  //     var saveData = (function () {
  //       var a = document.createElement("a");
  //       document.body.appendChild(a);
  //       a.style = "display: none";
  //       return function (data, fileName) {
  //         let url = window.URL.createObjectURL(data);
  //         a.href = url;
  //         a.download = fileName;
  //         a.click();
  //         window.URL.revokeObjectURL(url);
  //       };
  //     }());
  //     if (notifyPDF) {
  //       console.log("PDF size", `${pdf.size} Bytes`);
  //       if (pdf.size > 2000000) {
  //         console.log("PDF is above 2MB", `${pdf.size} Bytes`);
  //         // pdf is not going to be sent.
  //         let formData = new FormData();
  //         formData.append("pdfContent", "pdf is above 2MB");
  //         try {
  //           const response = await axios.post(`${window.location.pathname}`, formData, {
  //             headers: {
  //               'Content-Type': 'multipart/form-data',
  //             },
  //           });
  //           if (response.status === 200) {
  //             location.replace(`/${currentTargetID}/status`);
  //             notifyPDF = false;
  //           }

  //         } catch (error) {
  //           console.error("Error: notify pdf", error);
  //           location.replace(`/${currentTargetID}/error`);
  //         }
  //       } else {
  //         let formData = new FormData();
  //         let file = new File([pdf], fileName, { type: 'application/pdf' });
  //         formData.append("pdfContent", file, fileName);
  //         try {
  //           const response = await axios.post(`${window.location.pathname}`, formData, {
  //             headers: {
  //               'Content-Type': 'multipart/form-data',
  //             },
  //             timeout: 120000,
  //             clarifyTimeoutError: true,
  //           });
  //           if (response.status === 200) {
  //             location.replace(`/${currentTargetID}/status`);
  //             notifyPDF = false;
  //           }

  //         } catch (error) {
  //           console.error("Error:", error);
  //           location.replace(`/${currentTargetID}/error`);
  //         }

  //       }

  //     } else {
  //       saveData(pdf, fileName);
  //       showBtns();
  //     }
  //     isPrintPDFByClick = false;
  //   }
  //     exportHTMLToPDF(pages, "blob").finally(() => {
  //       // Remove the temporary font override after export finishes
  //       const s = document.getElementById('pdf-summary-font-override');
  //       if (s && s.parentNode) s.parentNode.removeChild(s);
  //     });

  //   function showBtns() {
  //     $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
  //     formsLoader.style.display = "none";
  //     loaderpopup.style.display = "none";
  //     Array.from(pages).forEach(el => el.style.opacity = 0);
  //     Array.from(govukSummaryList).forEach(el => el.style.display = "block");
  //     Array.from(govukHeadingM).forEach(el => el.style.display = "block");
  //     submitBtn.style.display = "block";
  //     pdfBtn.style.display = "block";
  //     footerMeta.style.display = "block";
  //     footer.style.display = "block";
  //     header.style.display = "block";
  //     mainTemplate.style["background-color"] = "white";
  //     summaryHeader.style.display = "block";
  //     summarySubHeader.style.display = "none"
  //     refTime.style.display = "flex";
  //     refTime.style.justifyContent = "space-between";
  //     formNamePrint.style.opacity = 1;
  //     if (cookies) cookies.style.display = "block";
  //     printedSummaryContainer.style.display = "none";
  //     Array.from(listRowBottomLine).forEach(el => el.style.borderBottom = "1px solid #b1b4b6");
  //     Array.from(listKeyBottomLine).forEach(el => el.style.borderBottom = "1px solid #b1b4b6");
  //     Array.from(listValueBottomLine).forEach(el => el.style.borderBottom = "1px solid #b1b4b6");
  //     Array.from(listActionsBottomLine).forEach(el => el.style.borderBottom = "1px solid #b1b4b6");
  //     Array.from(subheaderPrint).forEach(el => el.style.display = "none");
  //     for (btn of $('dd')) {
  //       if (btn.getAttribute('class') === "govuk-summary-list__actions") btn.style.opacity = 1;
  //     }
  //   }
  // }
});