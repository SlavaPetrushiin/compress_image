"use strict";
import { dataURLtoBlob, fetchApi } from "./helpers.js";
import { Loader } from './loader.js';
import { Preview } from './preview.js';
import { Alert, ALERT_TYPE } from './alert.js';

window.onload = function () {
    const inputFile = document.querySelector("input[name=photos]");
    const listPreview = document.querySelector('.list_preview');
    const formElem = document.querySelector('#formElem');
    const MAX_WIDTH = 900;
    const MAX_HEIGHT = 700;
    let Load = new Loader();
    let AlertPop = new Alert();

    function readFiles(files) {
        let total = files.length;
        let loaded = 0;
        Load.show();
        AlertPop.hide();

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
                    await compressImage(originalImg.src);

                    if (loaded == total) {
                        Load.hide();
                    }
                } catch (e) {
                    Load.hide();
                    AlertPop.show(`Не удалось выполнить загрузку, Error: ${e}, ${e.message}`, ALERT_TYPE.warning);
                }
            }

            reader.onerror = function (e) {
                Load.hide();
                AlertPop.show(`Не удалось выполнить загрузку, Error: ${e}, ${e.message}`, ALERT_TYPE.warning);
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

                let base64 = canvas.toDataURL("image/jpeg", 0.7);

                new Preview(listPreview, base64);

                resolve(base64);
            }

            img.error = function (e) {
                reject(e);
            }

            img.src = base64;
        })
    }

    function isValidateForm() {
        //Если первый элемент в списке есть и у него установлен дата атрибут === "preview-item", то можно отправить данные на сервер
        const firstElem = listPreview.firstElementChild;
        if (firstElem && firstElem.dataset.previewItem) {
            return true;
        }
        return false;
    }

    /*function showAlert(text = "", type = ALERT_TYPE.success) {
        if (alert.style.display === 'block') {
            alert.style.display = "none";
            alertText.innerText = "";
            return;
        }

        alert.style.display = "flex";
        alert.classList.add(`alert__${type}`);
        alertText.innerText = text;
    }*/

    /* Listener */
    formElem.addEventListener('submit', event => {
        event.preventDefault();

        if (!isValidateForm()) {
            AlertPop.show("Необходимо загрузить изображения", ALERT_TYPE.warning);
            return;
        }

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
                AlertPop.show('Данные отправлены', ALERT_TYPE.success);
            })
            .catch(e => {
                AlertPop.show(`${e}`, ALERT_TYPE.error);
            })
            .finally(() => {
                Load.hide();
            })
    });
    inputFile.addEventListener("change", (event) => readFiles(event.target.files));
    //listPreview.addEventListener("click", removeItemPreview);
}