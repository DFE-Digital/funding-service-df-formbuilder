var fileUploadComponent = $('.govuk-file-upload');
var buttoncomponent = $('.govuk-button');
var goOn = true;
const delay = milliseconds => new Promise(resolve => setTimeout(() => resolve(), milliseconds));

const checkFileSize = (size) => {
    const sizeInMB = ((size / 1024) / 1024).toFixed(4);
    return sizeInMB < 10; // Less than 10 MB
}
const _runnerTimeoutEl = (typeof document !== 'undefined') && document.getElementById('timeout');
const MAX_ALLOWED_UPLOAD_TIME = _runnerTimeoutEl && _runnerTimeoutEl.value
    ? Number(_runnerTimeoutEl.value)/1000
    : 300; // seconds (default fallback)
    

// --- Step 1: Try Network Information API ---
function estimateUploadTime(file, currentTargetID) {
  if ("connection" in navigator) {
    const conn = navigator.connection;
    const downlinkMbps = conn.downlink || 1;
    const uploadMbps = downlinkMbps * 0.4;
    const uploadBytesPerSec = (uploadMbps * 1024 * 1024) / 8;
    const estimatedTime = file.size / uploadBytesPerSec;

    if (estimatedTime > MAX_ALLOWED_UPLOAD_TIME) {
      // do your UI reset + submit
      $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
      $('#' + currentTargetID + '.pop').hide();
      $('#' + currentTargetID + "_file").val(null);

      try {
        document.getElementById(`filebandwidtherror_${currentTargetID}`).value = `true`;
        document.getElementById("form-submit").requestSubmit();
      } catch (e) {
        console.error(e.message);
      }

      return false;
    }

    return true;
  }

  return null;
}
// --- Step 2: Fallback - Measure actual upload speed ---
function uploadWithSpeedCheck(url, file, formData, currentTargetID) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();
    
    // Set explicit timeout for XHR (in milliseconds) - consistent across all browsers
    xhr.timeout = MAX_ALLOWED_UPLOAD_TIME * 1000;

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && event.loaded > 0) {
        const duration = (Date.now() - startTime) / 1000; // seconds
        const speedBps = event.loaded / duration;
        const predictedTotalTime = file.size / speedBps;

        if (predictedTotalTime > MAX_ALLOWED_UPLOAD_TIME) {
          xhr.abort();
          $("#" + currentTargetID + ".digital-forms-loader").fadeOut(200);
          $("#" + currentTargetID + ".pop").hide();
          $(".show-error").show();
          reject("Upload too slow");
          
        }
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        $(".show-error").hide();
        try {
          const json = JSON.parse(xhr.responseText);
          resolve(json);
        } catch (err) {
          reject("Invalid JSON response");
        }
      } else {
        $(".show-error").show();
        reject(`Server returned ${xhr.status}`);
      }
    };

    xhr.onerror = () => {
      $(".show-error").show();
      reject("Network error");
    };
    
    // Handle timeout event - ensures proper timeout handling in all browsers including Edge
    xhr.ontimeout = () => {
      $(".show-error").show();
      reject("Upload timeout - exceeded " + MAX_ALLOWED_UPLOAD_TIME + " seconds");
    };

    xhr.open("POST", url);
    xhr.send(formData);
  });
}


$("input[type='file']").on('change', async function (e) {
    const currentTargetIndex = fileUploadComponent.index($("#" + e.currentTarget.id));
    const fileData = fileUploadComponent[currentTargetIndex].files[0];
    const fileType = fileUploadComponent[currentTargetIndex].files[0].type;
    const currentTargetID = e.currentTarget.id.split('_')[0];
    if (document.getElementById("filextensionerror"))
        document.getElementById("filextensionerror").value = "default value";
    if (document.getElementById(`filesizeerror_${currentTargetID}`)) {
        document.getElementById(`filesizeerror_${currentTargetID}`).value = "default";
    }
    document.getElementById(currentTargetID + "_text").innerText = 'Please wait, while the system is scanning for virus...';
    $('#' + currentTargetID + '.digital-forms-loader').fadeTo(200, 1);
    $('.upload-dialog').hide();
    $('.Validation-dialog').hide();
    $('.Validation-datavaliddialog').hide();
    $('.Validation-datamissdialog').hide();
    $('.Validation-colmissdialog').hide();
    $('.show-error').hide();
    $('.service-down').hide();
    $('#' + currentTargetID + '.pop').show();


    var formData = new FormData();
    formData.append('fileupload', fileData);
    formData.append('fileType', fileType);
    formData.append('compId', currentTargetID);
    const selectedFile = e.target.accept;
    let acceptedFiles = selectedFile.split(",");
    const currentUrl = window.location.pathname.split('/');
    const formPageUrl = `/${currentUrl[1]}/${currentUrl[2]}`;
    let filenameWithoutExtension = fileData.name.substring(0, fileData.name.lastIndexOf('.')) || fileData.name;
    filenameWithoutExtension = filenameWithoutExtension.replace(/\s+/g, "_") // Replace empty space with underscore
    // Checks if filename has characters other than [a-zA-Z], numbers and underscore
    if (!filenameWithoutExtension.match(/^\w+$/)) {
        $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
        $('#' + currentTargetID + '.pop').hide();
        $('#' + currentTargetID + '.upload-dialog').hide();
        $('#' + currentTargetID + '.Validation-dialog').hide();
        $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
        $('#' + currentTargetID + '.Validation-datamissdialog').hide();
        $('#' + currentTargetID + '.Validation-colmissdialog').hide();
        $('#' + currentTargetID + "_file").val(null);
        try {
            document.getElementById(`filenameerror_${currentTargetID}`).value = `true`;
            document.getElementById("form-submit").requestSubmit();
        } catch (e) {
            console.error(e.message);
        }
        return;
    }
    if (acceptedFiles.includes(fileType)) {
        const lessThan10MB = checkFileSize(fileData.size); // True if less than 10 MB
        if (!lessThan10MB) {
            $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
            $('#' + currentTargetID + '.pop').hide();
            $('#' + currentTargetID + '.upload-dialog').hide();
            $('#' + currentTargetID + '.Validation-dialog').hide();
            $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
            $('#' + currentTargetID + '.Validation-datamissdialog').hide();
            $('#' + currentTargetID + '.Validation-colmissdialog').hide();
            $('#' + currentTargetID + "_file").val(null);
            try {
                document.getElementById(`filesizeerror_${currentTargetID}`).value = `true`;
                document.getElementById("form-submit").requestSubmit();
            } catch (e) {
                console.error(e.message);
            }
            return;
        }
    // ====================================================== 
    // 🚀 STEP 1: Check estimated upload time
    // ====================================================== 
    const quickCheck = estimateUploadTime(fileData, currentTargetID);
    if (quickCheck === false) {
        $("#" + currentTargetID + ".digital-forms-loader").fadeOut(200);
        $("#" + currentTargetID + ".pop").hide();
        $("#" + currentTargetID + "_file").val(null);
        return;
    }
    // ====================================================== 
    // 🚀 STEP 2: Fallback if NetworkInformation unsupported 
    // ====================================================== 
    if (quickCheck === null) {
        try {
                const res = await uploadWithSpeedCheck("/file-upload-blob", fileData, formData, currentTargetID);
                goOn = true;
                setTimeout(async () => {
                try {
                    if (currentTargetID) {
                    await getDataAsync(`/get-file-status?fileId=${res.data.fileId}&compName=${this.id}`, 'swaggerVersion', res, this, currentTargetID);
                }
            } catch (error) {
            console.log(error);
                }
            }, 2000); 
            }
        catch (err) {
            console.error("Speed check failed:", err);
            $("#" + currentTargetID + ".service-down").show();
        }
        return;
        //Skip normal fetch path
        }
                        // ====================================================== 
                        // ✅ Normal upload path (NetworkInformation OK) 
                        // ====================================================== 
                        try {
                            // Create AbortController for timeout support across all browsers (Chrome, Edge, Firefox)
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => {
                              controller.abort();
                            }, MAX_ALLOWED_UPLOAD_TIME * 1000); // Convert seconds to milliseconds
                            
                            fetch("/file-upload-blob", {
                                method: "post",
                                body: formData,
                                keepalive: true,
                                signal: controller.signal, // Add abort signal for timeout
                            }).then(response => {
                                clearTimeout(timeoutId); // Clear timeout on successful response
                                if (response.status === 404) {
                                    throw new TypeError("404")
                                } else {
                                    return response.json()
                                }
                            }).then(async (res) => {
                                    goOn = true;
                                    setTimeout(async () => {
                                            try {
                                                if (currentTargetID) {
                                                    await getDataAsync(`/get-file-status?fileId=${res.data.fileId}&compName=${this.id}`, 'swaggerVersion', res, this, currentTargetID);
                                                    }
                                                } catch (error) {
                                                    console.log(error);
                                                }
                                            }, 2000);
                                    }).catch((err) => {
                                    if (err.name === 'AbortError') {
                                        console.log("Upload timeout - exceeded " + MAX_ALLOWED_UPLOAD_TIME + " seconds");
                                        $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                                        $('#' + currentTargetID + '.pop').hide();
                                        $('#' + currentTargetID + '.upload-dialog').hide();
                                        $('#' + currentTargetID + '.Validation-dialog').hide();
                                        $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
                                        $('#' + currentTargetID + '.Validation-datamissdialog').hide();
                                        $('#' + currentTargetID + '.Validation-colmissdialog').hide();
                                        $('#' + currentTargetID + '.show-error').show();
                                        $('#' + currentTargetID + "_file").val(null);
                                        $(".show-error").show();
                                    } else if (err.message === '404') {
                                        console.log(err);
                                        $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                                        $('#' + currentTargetID + '.pop').hide();
                                        $('#' + currentTargetID + '.upload-dialog').hide();
                                        $('#' + currentTargetID + '.Validation-dialog').hide();
                                        $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
                                        $('#' + currentTargetID + '.Validation-datamissdialog').hide();
                                        $('#' + currentTargetID + '.Validation-colmissdialog').hide();
                                        $('#' + currentTargetID + '.show-error').show();
                                        $('#' + currentTargetID + "_file").val(null) 
                                        $(".show-error").show();
                                    } else {
                                        console.log(err);
                                        $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                                        $('#' + currentTargetID + '.pop').hide();
                                        $('#' + currentTargetID + '.upload-dialog').hide();
                                        $('#' + currentTargetID + '.Validation-dialog').hide();
                                        $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
                                        $('#' + currentTargetID + '.Validation-datamissdialog').hide();
                                        $('#' + currentTargetID + '.Validation-colmissdialog').hide();
                                        $('#' + currentTargetID + '.service-down').show();
                                        $('#' + currentTargetID + "_file").val(null);
                                        $(".show-error").show();
                                    }
                                });
                            }
                            catch (e) {
                                console.error(e.message);
                                $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                                $('#' + currentTargetID + '.pop').hide();
                                $('#' + currentTargetID + '.upload-dialog').hide();
                                $('#' + currentTargetID + '.Validation-dialog').hide();
                                $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
                                $('#' + currentTargetID + '.Validation-datamissdialog').hide();
                                $('#' + currentTargetID + '.Validation-colmissdialog').hide();
                                $('#' + currentTargetID + '.service-down').show();
                                $(".show-error").show();
                            };
                        } else {
                            $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                            $('#' + currentTargetID + '.pop').hide();
                            $('#' + currentTargetID + '.upload-dialog').hide();
                            $('#' + currentTargetID + '.Validation-dialog').hide();
                            $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
                            $('#' + currentTargetID + '.Validation-datamissdialog').hide();
                            $('#' + currentTargetID + '.Validation-colmissdialog').hide();
                            $('#' + currentTargetID + "_file").val(null);
                            try {

            document.getElementById("filextensionerror").value = `true_${currentTargetID}`;
                                document.getElementById("form-submit").requestSubmit();
                            } catch (e) {
                                console.error(e.message);
                            }
                        }
                    });

const getDataAsync = async (url, path, res, _this, currentTargetID) => {
    let response;
    let result;
    let count = 0;
    while (goOn) {

        $('#' + currentTargetID + '.digital-forms-loader').fadeTo(200, 1);
        $('#' + currentTargetID + '.pop').show();
        try {
            response = await fetch(url);
        } catch (error) {
            console.log(error);
        };
        try {
            result = await response.json();
        } catch (error) {
            console.log(error);
        };
        count++;
        if (result.scan === "Okay" && result.status === "scan allowed") {
            goOn = false;
            $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
            $('#' + currentTargetID + '.pop').hide();
            $('#' + currentTargetID + '.upload-dialog').show();
            $('#' + currentTargetID + '.Validation-dialog').hide();
            $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
            $('#' + currentTargetID + '.Validation-datamissdialog').hide();
            $('#' + currentTargetID + '.Validation-colmissdialog').hide();
            $('#' + currentTargetID + '.show-error').hide();
            $('.govuk-error-summary').hide();
            $(".govuk-form-group").removeClass("govuk-form-group--error");
            $(".govuk-error-message").fadeTo(0, 0);

            $('#' + currentTargetID + '.summary-file-exists').hide();
            if (_this.id.includes('_dataImport')) {

                document.getElementById(currentTargetID + '_btn').classList.remove('govuk-button--disabled');
                document.getElementById(currentTargetID + '_btn').classList.remove('govuk-button--secondarydisableclick');
                document.getElementById(currentTargetID + '_btn').removeAttribute('aria-disabled');
                document.getElementById(currentTargetID + '_btn').removeAttribute('disabled');
                document.getElementById(currentTargetID + "_text").innerText = 'Please wait, while the system performs different data validation';
                $("#" + _this.id.replace('_dataImport', "")).val(`${res.data.fileId}|${res.data.fileName}`);
            }
            else {
                $("#" + _this.id.replace('_file', "")).val(`${res.data.fileId}|${res.data.fileName}`);
            }
            try {
                const currentUrl = window.location.pathname.split('/');
                const formPageUrl = `/${currentUrl[1]}/${currentUrl[2]}`;
            } catch (e) {
                console.error(e.message);
            }

            return result;
        } else if (result.scan !== "Unscanned" && result.status === "scan allowed") {
            goOn = false;
            $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
            $('#' + currentTargetID + '.pop').hide();
            $('#' + currentTargetID + '.upload-dialog').hide();
            $('#' + currentTargetID + '.Validation-dialog').hide();
            $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
            $('#' + currentTargetID + '.Validation-datamissdialog').hide();
            $('#' + currentTargetID + '.Validation-colmissdialog').hide();
            $('#' + currentTargetID + '.show-error').show();
            $('#' + currentTargetID + "_file").val(null);
            return null;
        } else if (count >= 40) { // 40*3 = 120 seconds
            goOn = false;
            $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
            $('#' + currentTargetID + '.pop').hide();
            $('#' + currentTargetID + '.upload-dialog').hide();
            $('#' + currentTargetID + '.Validation-dialog').hide();
            $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
            $('#' + currentTargetID + '.Validation-datamissdialog').hide();
            $('#' + currentTargetID + '.Validation-colmissdialog').hide();
            $('#' + currentTargetID + '.service-down').show();
            $('#' + currentTargetID + "_file").val(null);
            return null;
        }
        else {
            goOn = true;
        }
        await delay(3000); // 3 seconds delay
    }
}


$('.govuk-button--secondary').on('click', async function (e) {
    const currentTargetID = e.currentTarget.id.split('_')[0];
    const currentTargetIndex = fileUploadComponent.index($("#" + currentTargetID + "_dataImport"));
    $('#' + currentTargetID + '.digital-forms-loader').fadeTo(200, 1);
    $('.upload-dialog').hide();
    $('.Validation-dialog').hide();
    $('.Validation-datavaliddialog').hide();
    $('.Validation-datamissdialog').hide();
    $('.Validation-colmissdialog').hide();
    $('.show-error').hide();
    $('.service-down').hide();
    $('#' + currentTargetID + '.pop').show();
    $('#' + currentTargetID + '.digital-forms-loader').fadeTo(200, 1);
    $('#' + currentTargetID + '.pop').show();
    const pathname = window.location.pathname;
    const parsedResult = pathname.split("/");
    const formId = parsedResult[1]

    const fileData = fileUploadComponent[currentTargetIndex].files[0].name.replaceAll(" ","_");
    const fileType = fileUploadComponent[currentTargetIndex].files[0].type;

    var formData = new FormData();
    formData.append('filedata', fileUploadComponent[currentTargetIndex].files[0]);
    formData.append('filename', fileData);
    formData.append('filetype', fileType);
    formData.append('path', pathname);
    formData.append('formid', formId);
    formData.append('compName', currentTargetID)

    try {
        // Create AbortController for timeout support across all browsers (Chrome, Edge, Firefox)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, MAX_ALLOWED_UPLOAD_TIME * 1000); // Convert seconds to milliseconds
        
        let response = fetch("/get-Validatefile-status", {
            method: "post",
            body: formData,
            signal: controller.signal, // Add abort signal for timeout
        }).then(response => {
            clearTimeout(timeoutId); // Clear timeout on successful response
            return response.json();
        })
            .then(async res => {
                if (res.status === 'success') {
                    $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                    $('#' + currentTargetID + '.pop').hide();
                    $('#' + currentTargetID + '.Validation-dialog').show();
                    $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
                    $('#' + currentTargetID + '.Validation-datamissdialog').hide();
                    $('#' + currentTargetID + '.Validation-colmissdialog').hide();
                    $('#' + currentTargetID + '.show-error').hide();
                    $('#' + currentTargetID + '.summary-file-exists').hide();
                }
                else if (res.status.includes('column header missing')) {
                    $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                    $('#' + currentTargetID + '.pop').hide();
                    $('#' + currentTargetID + '.upload-dialog').hide();
                    $('#' + currentTargetID + '.Validation-dialog').hide();
                    let innerHTML = "";
                    for (let i = 0; i < res.data.columnmiss.split(`~`).length - 1; i++) {
                        innerHTML += `<li class="lierroritem">` + res.data.columnmiss.split('~')[i] + `</li>`
                    }
                    document.getElementById(currentTargetID + '_colmisssl').innerHTML = innerHTML;
                    $('#' + currentTargetID + '.Validation-colmissdialog').show();
                    $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
                    $('#' + currentTargetID + '.Validation-datamissdialog').hide();
                    $('#' + currentTargetID + "_file").val(null);
                }
                else if (res.status.includes('columns order mismatch')) {
                    $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                    $('#' + currentTargetID + '.pop').hide();
                    $('#' + currentTargetID + '.upload-dialog').hide();
                    $('#' + currentTargetID + '.Validation-dialog').hide();
                    let innerHTML = "";
                    for (let i = 0; i < res.data.columnreorder.split(`~`).length - 1; i++) {
                        innerHTML += `<li class="lierroritem">` + res.data.columnreorder.split('~')[i] + `</li>`
                    }
                    document.getElementById(currentTargetID + '_colmisssl').innerHTML = innerHTML;
                    $('#' + currentTargetID + '.Validation-colmissdialog').show();
                    $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
                    $('#' + currentTargetID + '.Validation-datamissdialog').hide();
                    $('#' + currentTargetID + "_file").val(null);
                }
                else if (res.status.includes('Data is empty')) {
                    $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                    $('#' + currentTargetID + '.pop').hide();
                    $('#' + currentTargetID + '.upload-dialog').hide();
                    $('#' + currentTargetID + '.Validation-dialog').hide();
                    let innerHTML = "";
                    for (let i = 0; i < res.data.datamiss.split(`~`).length - 1; i++) {
                        innerHTML += `<li class="lierroritem">` + res.data.datamiss.split('~')[i] + `</li>`
                    }
                    document.getElementById(currentTargetID + '_datamisssl').innerHTML = innerHTML;
                    $('#' + currentTargetID + '.Validation-datamissdialog').show();
                    $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
                    $('#' + currentTargetID + '.Validation-colmissdialog').hide();
                    $('#' + currentTargetID + "_file").val(null);
                }
                else if (res.status.includes('Data is not in allowed range')) {
                    $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                    $('#' + currentTargetID + '.pop').hide();
                    $('#' + currentTargetID + '.upload-dialog').hide();
                    $('#' + currentTargetID + '.Validation-dialog').hide();
                    $('#' + currentTargetID + '.Validation-datamissdialog').hide();
                    $('#' + currentTargetID + '.Validation-colmissdialog').hide();
                    let innerHTML = "";
                    for (let i = 0; i < res.data.datavalid.split(`~`).length - 1; i++) {
                        innerHTML += `<li class="lierroritem">` + res.data.datavalid.split('~')[i] + `</li>`
                    }
                    document.getElementById(currentTargetID + '_datavalidsl').innerHTML = innerHTML;
                    $('#' + currentTargetID + '.Validation-datavaliddialog').show();
                    $('#' + currentTargetID + "_file").val(null);
                }
                else {
                    $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                    $('#' + currentTargetID + '.pop').hide();
                    $('#' + currentTargetID + '.upload-dialog').hide();
                    $('#' + currentTargetID + '.Validation-dialog').hide();
                    $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
                    $('#' + currentTargetID + '.Validation-datamissdialog').hide();
                    $('#' + currentTargetID + '.Validation-colmissdialog').hide();
                    $('#' + currentTargetID + '.show-error').show();
                    $('#' + currentTargetID + "_file").val(null);
                }
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.log("Validation request timeout - exceeded " + MAX_ALLOWED_UPLOAD_TIME + " seconds");
                } else {
                    console.log(err);
                }
                $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
                $('#' + currentTargetID + '.pop').hide();
                $('#' + currentTargetID + '.upload-dialog').hide();
                $('#' + currentTargetID + '.Validation-dialog').hide();
                $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
                $('#' + currentTargetID + '.Validation-datamissdialog').hide();
                $('#' + currentTargetID + '.Validation-colmissdialog').hide();
                $('#' + currentTargetID + '.service-down').show();
                $('#' + currentTargetID + "_file").val(null)
            });
    } catch (e) {
        console.error(e.message);
        $('#' + currentTargetID + '.digital-forms-loader').fadeOut(200);
        $('#' + currentTargetID + '.pop').hide();
        $('#' + currentTargetID + '.upload-dialog').hide();
        $('#' + currentTargetID + '.Validation-dialog').hide();
        $('#' + currentTargetID + '.Validation-datavaliddialog').hide();
        $('#' + currentTargetID + '.Validation-datamissdialog').hide();
        $('#' + currentTargetID + '.Validation-colmissdialog').hide();
        $('#' + currentTargetID + '.show-error').show();
    };
});