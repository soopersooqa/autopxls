// ==UserScript==
// @name         pxls.space autotool
// @namespace    https://github.com/Moondarker/autopxls
// @date         2017-04-15
// @version      2.3
// @description  May be used together w/ templates script by Abupidr
// @author       Moondarker
// @match        http://*/*
// @updateURL    https://cdn.rawgit.com/Moondarker/autopxls/master/userscript.js
// @downloadURL  https://cdn.rawgit.com/Moondarker/autopxls/master/userscript.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    const opts = (location.search || "?").substr(1).split("&").map(x => x.split("=").map(a => unescape(a))).reduce((o, [k, v]) => Object.assign(o, {[k]: v}), {});
    if (typeof opts.template != "undefined") {
        window.App.saveImage = document.createElement('script');
        window.App.saveImage.src = "https://rawgit.com/moondarker/autopxls/master/autopxls.js";
        window.App.saveImage.onload = function () {
            var images = [
                {
                    title: "X" + opts.ox + "Y" + opts.oy,
                    x: opts.ox,
                    y: opts.oy,
                    image: opts.template,
                    algo: "random",
                    mode: "h",
                    convert: opts.convert || 1,
                    show: 1
                }
            ];
            var params = {
                cooldown: 100,
                debug: 0
            };

            window.App.saveImage(images, params.cooldown, params.debug);
            this.parentElement.removeChild(this);
        };

        document.head.appendChild(window.App.saveImage);
    }
})();