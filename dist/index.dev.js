"use strict";

var dropZone = document.querySelector(".drop-zone");
var fileInput = document.querySelector("#fileInput");
var browseBtn = document.querySelector("#browseBtn");
var bgProgress = document.querySelector(".bg-progress");
var progressPercent = document.querySelector("#progressPercent");
var progressContainer = document.querySelector(".progress-container");
var progressBar = document.querySelector(".progress-bar");
var status = document.querySelector(".status");
var sharingContainer = document.querySelector(".sharing-container");
var copyURLBtn = document.querySelector("#copyURLBtn");
var fileURL = document.querySelector("#fileURL");
var emailForm = document.querySelector("#emailForm");
var toast = document.querySelector(".toast");
var baseURL = "https://file-sharing-personal.herokuapp.com";
var uploadURL = "".concat(baseURL, "/api/files");
var emailURL = "".concat(baseURL, "/api/files/send");
var maxAllowedSize = 100 * 1024 * 1024; //100mb

browseBtn.addEventListener("click", function () {
  fileInput.click();
});
dropZone.addEventListener("drop", function (e) {
  e.preventDefault(); //   console.log("dropped", e.dataTransfer.files[0].name);

  var files = e.dataTransfer.files;

  if (files.length === 1) {
    if (files[0].size < maxAllowedSize) {
      fileInput.files = files;
      uploadFile();
    } else {
      showToast("Max file size is 100MB");
    }
  } else if (files.length > 1) {
    showToast("You can't upload multiple files");
  }

  dropZone.classList.remove("dragged");
});
dropZone.addEventListener("dragover", function (e) {
  e.preventDefault();
  dropZone.classList.add("dragged"); // console.log("dropping file");
});
dropZone.addEventListener("dragleave", function (e) {
  dropZone.classList.remove("dragged");
  console.log("drag ended");
}); // file input change and uploader

fileInput.addEventListener("change", function () {
  if (fileInput.files[0].size > maxAllowedSize) {
    showToast("Max file size is 100MB");
    fileInput.value = ""; // reset the input

    return;
  }

  uploadFile();
}); // sharing container listenrs

copyURLBtn.addEventListener("click", function () {
  fileURL.select();
  document.execCommand("copy");
  showToast("Copied to clipboard");
});
fileURL.addEventListener("click", function () {
  fileURL.select();
});

var uploadFile = function uploadFile() {
  console.log("file added uploading");
  files = fileInput.files;
  var formData = new FormData();
  formData.append("myfile", files[0]); //show the uploader

  progressContainer.style.display = "block"; // upload file

  var xhr = new XMLHttpRequest(); // listen for upload progress

  xhr.upload.onprogress = function (event) {
    // find the percentage of uploaded
    var percent = Math.round(100 * event.loaded / event.total);
    progressPercent.innerText = percent;
    var scaleX = "scaleX(".concat(percent / 100, ")");
    bgProgress.style.transform = scaleX;
    progressBar.style.transform = scaleX;
  }; // handle error


  xhr.upload.onerror = function () {
    showToast("Error in upload: ".concat(xhr.status, "."));
    fileInput.value = ""; // reset the input
  }; // listen for response which will give the link


  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      onFileUploadSuccess(xhr.responseText);
    }
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

var onFileUploadSuccess = function onFileUploadSuccess(res) {
  fileInput.value = ""; // reset the input

  status.innerText = "Uploaded"; // remove the disabled attribute from form btn & make text send

  emailForm[2].removeAttribute("disabled");
  emailForm[2].innerText = "Send";
  progressContainer.style.display = "none"; // hide the box

  var _JSON$parse = JSON.parse(res),
      url = _JSON$parse.file;

  console.log(url);
  sharingContainer.style.display = "block";
  fileURL.value = url;
};

emailForm.addEventListener("submit", function (e) {
  e.preventDefault(); // stop submission
  // disable the button

  emailForm[2].setAttribute("disabled", "true");
  emailForm[2].innerText = "Sending";
  var url = fileURL.value;
  var formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value
  };
  console.log(formData);
  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  }).then(function (res) {
    return res.json();
  }).then(function (data) {
    if (data.success) {
      showToast("Email Sent");
      sharingContainer.style.display = "none"; // hide the box
    }
  });
});
var toastTimer; // the toast function

var showToast = function showToast(msg) {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2000);
};
//# sourceMappingURL=index.dev.js.map
