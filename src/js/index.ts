"use strict";
import { dataURLtoBlob } from "./helpers";
import { Loader } from './loader';
import { Preview } from './preview';
import { Alert, ALERT_TYPE } from './alert';
import WebApi from "./api";

function getParams(url: any = window.location) {
    let params = {} as { UserName: string, ServiceTaskID: string };

    new URL(url).searchParams.forEach(function (val, key) {
        params[key] = val;
    });
    return params;
}

window.onload = function () {
    const inputFile: any = document.querySelector("input[name=photos]");
    const listPreview = document.querySelector('.list_preview');
    const formElem = document.querySelector('#formElem');
    const MAX_WIDTH = 900;
    const MAX_HEIGHT = 700;
    let Load = new Loader();
    const params = getParams();

    function readFiles(files) {
        let total = files.length;
        let loaded = 0;
        Load.show();

        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader();
            reader.onloadend = function (event) {
                let contents = event.target.result as string;
                let error = event.target.error;

                if (error != null) {
                    new Alert().show(`Не удалось загрузить файл`, ALERT_TYPE.error);
                    Load.hide();
                } else {
                    loaded++;

                    let originalImg: HTMLImageElement = new Image();
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

    function compressImage(base64 = "") {
        const canvas = document.createElement('canvas');
        const img = new Image();

        img.onload = function (e: any) {
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
            //Создать Preview
            new Preview(listPreview, base64);
        }

        img.src = base64;
    }

    function isValidateForm() {
        //Если первый элемент в списке есть и у него установлен дата атрибут === "preview-item", то можно отправить данные на сервер
        const firstElem: any = listPreview.firstElementChild;
        if (firstElem && firstElem.dataset.previewItem) {
            return true;
        }
        return false;
    }

    function sendForm(event) {
        event.preventDefault();
        let count = 1;

        if (!isValidateForm()) {
            new Alert().show("Необходимо загрузить изображения", ALERT_TYPE.warning);
            return;
        }

        if (!params['ServiceTaskID'] && !params['UserName']) {
            new Alert().show("Некорректные данные в url: ServiceTaskID или UserName", ALERT_TYPE.error);
            return;
        }

        let files: NodeListOf<HTMLImageElement> = document.querySelectorAll(".preview_img");

        function forEachPromise(files, fn) {
            Load.show();
            return files.reduce((promise, item) => promise.then(() => {
                return (async function () {
                    await fn(item);
                })()
            }), Promise.resolve());
        }

        function sendFile(file) {
            return WebApi.Superbase_UploadSTPhotoAdd(dataURLtoBlob(file.src), { ServiceTaskID: params.ServiceTaskID, UserName: params.UserName })
                .then(res => {
                    if (res >= 1) {
                        new Alert().show(`файл добавлен ${count++}`, ALERT_TYPE.success);
                        file.closest(".preview_item").remove();
                    }
                })
                .catch((e) => {
                    new Alert().show(`${e}`, ALERT_TYPE.error)
                })
        }

        forEachPromise(Array.from(files), sendFile)
            .then(() => {
                Load.hide();
            })
    }

    inputFile.addEventListener("change", (event) => { readFiles(event.target.files) });
    formElem.addEventListener('submit', sendForm);
}