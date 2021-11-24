"use strict";
import { createElementFromString } from "./helpers";

export function Modal(base64 = "", compPreview) { // base64 === "string"  compPreview === Preview
    this.templateDefault = `<div class="modal" data-type="">
        <div class="modal-content">
            <span class="close" data-modal="close"></span>
            <canvas class="canvas"></canvas>
            <div class="modal-controls">
                <span class="rotate"></span>                
            </div>
        </div>
    </div>`;

    let div: any = createElementFromString(this.templateDefault);
    let closeBtn = div.querySelector(".close");
    let rotateBtn = div.querySelector(".rotate");
    let img = new Image();
    img.src = base64;
    let canvas = div.querySelector(".canvas");
    let context = canvas.getContext("2d");
    //let download = div.querySelector(".download");
    let currentAngle = 0;

    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);

    document.body.appendChild(div);

    function removeModal() {
        div.remove();
    }

    function rotateImage() {
        currentAngle += 90;
        // swap the height and width
        canvas.height = canvas.width + (canvas.width = canvas.height, 0);

        context.save();
        // rotate the canvas center
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(currentAngle * Math.PI / 180); // Поворот canvas
        context.drawImage(img,
            -img.width / 2,
            -img.height / 2);
        context.restore();

        compPreview.changeSrcImage(canvas.toDataURL()); //обновить при повороте Preview
    }

    /*function downloadImage(e) {
        const link: any = document.createElement('a');
        link.download = 'download.jpeg';
        link.href = canvas.toDataURL("image/jpeg", 0.7);
        link.click();
        link.delete;
    }*/

    //EventListener
    //download.addEventListener('click', downloadImage);
    closeBtn.addEventListener('click', removeModal);
    rotateBtn.addEventListener('click', rotateImage);
}
