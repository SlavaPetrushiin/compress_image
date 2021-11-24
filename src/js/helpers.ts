export function dataURLtoBlob(dataUrl) {
    let arr = dataUrl.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// Fetch
export function fetchApi(url = "", option = {}) {
    return new Promise((resolve, reject) => {
        fetch(url, option)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    //console.error(`Запрос ${url} отклонен со статусом ${response.status}, ${response.statusText}`);
                    throw new Error(`Запрос ${url} отклонен со статусом ${response.status}, ${response.statusText}`);
                }
                return response.json();
            })
            .then(json => resolve(json))
            .catch(err => {
                reject(err);
            });
    })
}

//Create Element
export function createElementFromString(string = '', ownerTagName = "div") {
    let documentFragment = document.createDocumentFragment();
    let containerElement = document.createElement(ownerTagName);
    containerElement.innerHTML = string;
    while (containerElement.childNodes[0]) {
        documentFragment.appendChild(containerElement.childNodes[0]);
    }
    return Array.from(documentFragment.childNodes).find(x => x.nodeName.indexOf('text') < 0);
}

export function createElement(selector, className) {
    let el = document.createElement(selector);
    if (className) {
        el.classList.add(className);
    }
    return el;
}
