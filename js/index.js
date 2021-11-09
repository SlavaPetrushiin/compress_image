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


    function readFiles(files) {
        let total = files.length;
        let loaded = 0;
        Load.show();

        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader();

            reader.onloadstart = function () {
                reader.abort()
            }

            reader.onloadend = function (event) {
                let contents = event.target.result;
                let error = event.target.error;

                if (error != null) {
                    new Alert().show(`Не удалось загрузить файл`, ALERT_TYPE.error);
                    Load.hide();
                } else {
                    loaded++;

                    let originalImg = new Image();
                    originalImg.src = contents;
                    compressImage(originalImg.src);

                    if (loaded == total) {
                        Load.hide();
                    }
                }
            }

            reader.readAsDataURL(files[i]);
        }
        inputFile.value = '';
    }

    function compressImage(base64) {
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
        }

        img.src = base64;
    }

    function isValidateForm() {
        //Если первый элемент в списке есть и у него установлен дата атрибут === "preview-item", то можно отправить данные на сервер
        const firstElem = listPreview.firstElementChild;
        if (firstElem && firstElem.dataset.previewItem) {
            return true;
        }
        return false;
    }

    formElem.addEventListener('submit', event => {
        event.preventDefault();

        if (!isValidateForm()) {
            new Alert().show("Необходимо загрузить изображения", ALERT_TYPE.warning);
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
                new Alert().show('Данные отправлены', ALERT_TYPE.success);
            })
            .catch(e => {
                new Alert().show(`${e}`, ALERT_TYPE.error);
            })
            .finally(() => {
                Load.hide();
            })
    });
    inputFile.addEventListener("change", (event) => readFiles(event.target.files));
}