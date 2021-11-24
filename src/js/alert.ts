"use strict";
import { createElementFromString } from "./helpers";

export const ALERT_TYPE = {
    error: "error",
    warning: "warning",
    success: "success"
}

const TIMEOUT = 10000;

export function Alert() {
    this.alert;
    this.closeBtn;
    this.listAlerts = document.querySelector(".list_alerts");
    this.timeout;

    this.show = (text = "", type = ALERT_TYPE.success) => {
        let templateDefault = `<div class="alert">
                <span class="alert_text">${text}</span>
                <span class="alert_close_btn">&times;</span>
            </div >`;

        this.alert = createElementFromString(templateDefault);
        this.alert.classList.add(`alert__${type}`);
        this.closeBtn = this.alert.querySelector(".alert_close_btn");
        this.listAlerts.prepend(this.alert);

        this.closeBtn.addEventListener("click", this.hide);

        this.timeout = setTimeout(() => this.hide(), TIMEOUT);
    };

    this.hide = () => {
        if (this.alert) {
            this.alert.remove();
            clearTimeout(this.timeout);
        }
    };
}
