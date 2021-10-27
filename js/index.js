"use strict";
import { dataURLtoBlob, fetchApi, createElementFromString } from "./helpers.js";
import { Loader } from './loader.js';

window.onload = function () {
    const inputFile = document.querySelector("input[name=photos]");
    const listPreview = document.querySelector('.list_preview');
    const formElem = document.querySelector('#formElem');
    const alert = document.querySelector('.alert');
    const alertText = document.querySelector('.alert_text');
    const btnAlertClose = document.querySelector('.alert_close_btn');
    const btnSendForm = document.querySelector('.send');
    let Load = new Loader();

    const MAX_WIDTH = 900;
    const MAX_HEIGHT = 700;

    function readFiles(files) {
        for (let i = 0; i < files.length; i++) {
            processFile(files[i]);
        }
        inputFile.value = '';
    }

    function processFile(file) {
        let reader = new FileReader();

        reader.onload = async function (e) {
            try {
                let originalImg = new Image();
                originalImg.src = e.target.result;
                await compressImage(originalImg.src);
                isDisableForm();
            } catch (e) {
                showAlert(`Не удалось выполнить загрузку, Error: ${e}, ${e.message}`);
            }
        }

        reader.onerror = function (e) {
            showAlert(`Не удалось выполнить загрузку, Error: ${e}, ${e.message}`);
        }

        reader.readAsDataURL(file);
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
                reject("Error")
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
                getModal(base64);
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

    function getModal(base64) {
        let templateDefault = `<div class="modal">
            <div class="modal-content">
                <span class="close" data-modal="close"></span>
                <img class="modal-img" src=${base64}>
            </div>
        </div>`;
        let div = createElementFromString(templateDefault);
        let closeBtn = div.querySelector(".close");

        document.body.appendChild(div);

        function removeModal(event) {
            if (event.target.dataset.modal === "close") {
                div.remove();
                window.removeEventListener('click', removeModal);
            }
        }

        //EventListener
        closeBtn.addEventListener('click', removeModal);
        window.addEventListener('click', removeModal);
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




