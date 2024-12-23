(() => {
    "use strict";
    let bodyLockStatus = true;
    let bodyLockToggle = (delay = 500) => {
        if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
    };
    let bodyUnlock = (delay = 500) => {
        if (bodyLockStatus) {
            const lockPaddingElements = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                lockPaddingElements.forEach((lockPaddingElement => {
                    lockPaddingElement.style.paddingRight = "";
                }));
                document.body.style.paddingRight = "";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        if (bodyLockStatus) {
            const lockPaddingElements = document.querySelectorAll("[data-lp]");
            const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
            lockPaddingElements.forEach((lockPaddingElement => {
                lockPaddingElement.style.paddingRight = lockPaddingValue;
            }));
            document.body.style.paddingRight = lockPaddingValue;
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let addWindowScrollEvent = false;
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    class DynamicAdapt {
        constructor(type) {
            this.type = type;
        }
        init() {
            this.оbjects = [];
            this.daClassname = "_dynamic_adapt_";
            this.nodes = [ ...document.querySelectorAll("[data-da]") ];
            this.nodes.forEach((node => {
                const data = node.dataset.da.trim();
                const dataArray = data.split(",");
                const оbject = {};
                оbject.element = node;
                оbject.parent = node.parentNode;
                const parentSelectorMatch = dataArray[0].trim().match(/^\{(.+)\}(?:\s*(.+)?)$/);
                if (parentSelectorMatch) {
                    const parentSelector = parentSelectorMatch[1].trim();
                    const childSelector = parentSelectorMatch[2] ? parentSelectorMatch[2].trim() : null;
                    const parentElement = node.closest(parentSelector);
                    if (parentElement) оbject.destination = childSelector ? parentElement.querySelector(childSelector) : parentElement;
                } else оbject.destination = document.querySelector(`${dataArray[0].trim()}`);
                оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767.98";
                оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
                оbject.index = this.indexInParent(оbject.parent, оbject.element);
                this.оbjects.push(оbject);
            }));
            this.arraySort(this.оbjects);
            this.mediaQueries = this.оbjects.map((({breakpoint}) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`)).filter(((item, index, self) => self.indexOf(item) === index));
            this.mediaQueries.forEach((media => {
                const mediaSplit = media.split(",");
                const matchMedia = window.matchMedia(mediaSplit[0]);
                const mediaBreakpoint = mediaSplit[1];
                const оbjectsFilter = this.оbjects.filter((({breakpoint}) => breakpoint === mediaBreakpoint));
                matchMedia.addEventListener("change", (() => {
                    this.mediaHandler(matchMedia, оbjectsFilter);
                }));
                this.mediaHandler(matchMedia, оbjectsFilter);
            }));
        }
        mediaHandler(matchMedia, оbjects) {
            if (matchMedia.matches) оbjects.forEach((оbject => {
                this.moveTo(оbject.place, оbject.element, оbject.destination);
            })); else оbjects.forEach((({parent, element, index}) => {
                if (element.classList.contains(this.daClassname)) this.moveBack(parent, element, index);
            }));
        }
        moveTo(place, element, destination) {
            if (!destination) return;
            element.classList.add(this.daClassname);
            if (place === "last" || place >= destination.children.length) {
                destination.append(element);
                return;
            }
            if (place === "first") {
                destination.prepend(element);
                return;
            }
            destination.children[place].before(element);
        }
        moveBack(parent, element, index) {
            element.classList.remove(this.daClassname);
            if (parent.children[index] !== void 0) parent.children[index].before(element); else parent.append(element);
        }
        indexInParent(parent, element) {
            return [ ...parent.children ].indexOf(element);
        }
        arraySort(arr) {
            if (this.type === "min") arr.sort(((a, b) => {
                if (a.breakpoint === b.breakpoint) {
                    if (a.place === b.place) return 0;
                    if (a.place === "first" || b.place === "last") return -1;
                    if (a.place === "last" || b.place === "first") return 1;
                    return 0;
                }
                return a.breakpoint - b.breakpoint;
            })); else {
                arr.sort(((a, b) => {
                    if (a.breakpoint === b.breakpoint) {
                        if (a.place === b.place) return 0;
                        if (a.place === "first" || b.place === "last") return 1;
                        if (a.place === "last" || b.place === "first") return -1;
                        return 0;
                    }
                    return b.breakpoint - a.breakpoint;
                }));
                return;
            }
        }
    }
    const da = new DynamicAdapt("max");
    da.init();
    gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);
    let panelsSection = document.querySelector("#panels");
    if (panelsSection) {
        let tween, panelsContainer = document.querySelector("#panels-container");
        document.querySelectorAll("[data-anchor]").forEach((anchor => {
            anchor.addEventListener("click", (function(e) {
                e.preventDefault();
                let targetElem = document.querySelector(e.target.getAttribute("href")), y = targetElem;
                if (targetElem && panelsContainer.isSameNode(targetElem.parentElement)) {
                    let totalScroll = tween.scrollTrigger.end - tween.scrollTrigger.start, totalMovement = (panels.length - 1) * targetElem.offsetWidth;
                    y = Math.round(tween.scrollTrigger.start + targetElem.offsetLeft / totalMovement * totalScroll);
                }
                gsap.to(window, {
                    scrollTo: {
                        y,
                        autoKill: false
                    },
                    duration: 1
                });
            }));
        }));
        const panels = gsap.utils.toArray("#panels-container [data-panel]");
        ScrollTrigger.matchMedia({
            "(min-width: 991.98px)": function() {
                tween = gsap.to(panels, {
                    xPercent: -100 * (panels.length - 1),
                    ease: "none",
                    scrollTrigger: {
                        trigger: "#panels-container",
                        pin: true,
                        start: `top-=69 top`,
                        scrub: 1,
                        end: () => "+=" + (panelsContainer.offsetWidth - innerWidth)
                    }
                });
            }
        });
    }
    document.addEventListener("click", (function(e) {
        if (bodyLockStatus && e.target.closest(".icon-menu")) {
            bodyLockToggle();
            document.documentElement.classList.toggle("menu-open");
        }
        if (e.target.closest(".pulsingButton")) {
            const pulsingBtn = e.target.closest(".pulsingButton");
            pulsingBtn.closest(".flying-whatsapp").classList.toggle("shown");
        }
    }));
    window["FLS"] = false;
})();