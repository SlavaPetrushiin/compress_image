"use strict";
import { createElementFromString } from "./helpers.js";

export function Loader() {
    this.templateDefault = `<div class="wrapper_loader"><div class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>`;

    this.show = function () {
        let div = createElementFromString(this.templateDefault);
        document.body.appendChild(div);
    }

    this.hide = function () {
        let el = document.querySelector(".wrapper_loader");
        if (el)
            el.remove();
    }
}