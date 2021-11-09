"use strict";
import { createElementFromString } from "./helpers.js";
import { Modal } from './modal.js';

export function Preview(parent, base64 = "") {
    this.templateDefault = `<li class="preview_item" data-preview-item="preview-item">
        <span class="remove"></span>
        <img class="preview_img">
    </li>`
    this.parent = parent;
    this.base64 = base64;
    this.li = createElementFromString(this.templateDefault, "li");
    this.closeBtn = this.li.querySelector(".remove");
    this.img = this.li.querySelector(".preview_img");
    this.img.src = this.base64;

    parent.appendChild(this.li);

    this.getModal = (event) => {
        let target = event.target;
        if (target.tagName === "IMG") {
            this.showModal(this.img.src);
        }
    }

    this.removePreview = () => {
        this.li.remove();
    }

    this.showModal = (base64 = "") => {
        new Modal(base64, this);
    }
    //обновить при повороте Preview
    this.changeSrcImage = (base64 = "") => {
        this.img.src = base64;
    }

    this.li.addEventListener('click', this.getModal);
    this.closeBtn.addEventListener('click', this.removePreview);
}   
