"use strict";
import { dataURLtoBlob, fetchApi, createElementFromString } from "./helpers.js";
import { Loader } from './loader.js';
import { Modal } from './modal.js';

window.onload = function () {
    const inputFile = document.querySelector("input[name=photos]");
    const listPreview = document.querySelector('.list_preview');
    const formElem = document.querySelector('#formElem');
    const alert = document.querySelector('.alert');
    const alertText = document.querySelector('.alert_text');
    const btnAlertClose = document.querySelector('.alert_close_btn');
    const btnSendForm = document.querySelector('.send');
    const MAX_WIDTH = 900;
    const MAX_HEIGHT = 700;
    let Load = new Loader();

    function readFiles(files) {
        let total = files.length;
        let loaded = 0;
        Load.show();

        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader();

            reader.onload = async function (e) {
                try {
                    loaded++;
                    /*if (loaded == 5) {
                        readerReader.abort() //прерывание чтения файла, необходимо для теста попадания в reader.onerror
                    }*/

                    let originalImg = new Image();
                    originalImg.src = e.target.result;
                    compressImage(originalImg.src);

                    if (loaded == total) {
                        Load.hide();
                    }

                    isDisableForm();
                } catch (e) {
                    Load.hide();
                    showAlert(`Не удалось выполнить загрузку, Error: ${e}, ${e.message}`, "warning");
                }
            }

            reader.onerror = function (e) {
                Load.hide();
                showAlert(`Не удалось выполнить загрузку, Error: ${e}, ${e.message}`, "warning");
            }

            reader.readAsDataURL(files[i]);
        }
        inputFile.value = '';
    }

    function compressImage(base64) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const img = new Image();

            img.onload = function (e) {
                let width = e.target.width;
                let height = e.target.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round((height *= MAX_WIDTH / width));
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round((width *= MAX_HEIGHT / height));
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                let compressData = canvas.toDataURL("image/jpeg", 0.7);

                createItemPreview(listPreview, compressData);

                resolve(compressData);
            }

            img.error = function (e) {
                reject(e);
            }

            img.src = base64;
        })
    }

    function createItemPreview(parent, base64) {
        if (!base64 || !parent) return;

        let templateDefault = `<li class="preview_item">
            <span class="remove"></span>
            <img class="preview_img" src=${base64}>
        </li>`;

        let li = createElementFromString(templateDefault, "li");
        parent.appendChild(li);

        li.addEventListener('click', (event) => {
            let target = event.target;
            if (target.tagName === "IMG") {
                showModal(base64);
            }
        });
    }

    function removeItemPreview(event) {
        let target = event.target;

        if (target.tagName !== 'SPAN') {
            return;
        }
        let parent = target.closest('li');
        parent.remove();
        isDisableForm();
    }

    function isDisableForm() {
        if (listPreview.firstChild) {
            btnSendForm.disabled = false;
        } else {
            btnSendForm.disabled = true;
        }
    }

    function showModal(base64) {
        new Modal(base64);
    }

    function showAlert(text = "", type = "success") {
        if (alert.style.display === 'block') {
            alert.style.display = "none";
            alertText.innerText = "";
            return;
        }

        alert.style.display = "flex";
        alert.classList.add(`alert__${type}`);
        alertText.innerText = text;
    }

    /* Listener */
    formElem.addEventListener('submit', event => {
        event.preventDefault();
        let formData = new FormData();
        let files = document.querySelectorAll(".preview_img");
        files.forEach(el => formData.append("image", dataURLtoBlob(el.src)));
        Load.show();

        fetchApi("", {
            method: "POST",
            body: formData
        })
            .then(response => {
                listPreview.innerHTML = '';
                showAlert('Данные отправлены', 'success');
            })
            .catch(e => {
                showAlert(`${e}`, 'error');
            })
            .finally(() => {
                Load.hide();
            })
    });
    inputFile.addEventListener("change", (event) => readFiles(event.target.files));
    listPreview.addEventListener("click", removeItemPreview);
    btnAlertClose.addEventListener("click", _ => alert.style.display = "none");
}