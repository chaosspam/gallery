"use strict";
(function(){
    window.addEventListener("load", init);

    const id = document.getElementById.bind(document);
    const qs = document.querySelector.bind(document);
    const qsa = document.querySelectorAll.bind(document);

    function init() {
        let modal = qs(".modal");
        requestImages();
        modal.addEventListener("click", () => {modal.classList.add("hidden")});
    }

    function requestImages() {
        fetch("data/gallery.json")
            .then(checkStatus)
            .then(res => res.json())
            .then(populateImages)
            .catch(console.error);

    }

    function populateImages(data) {
        let gallery = id("gallery");
        for(let i = 0; i < 3 && i < data.length; i++) {
            let art = data[i];
            let frame = generateImage(art, false);
            gallery.appendChild(frame);
        }
        for(let i = 3; i < data.length; i++) {
            let art = data[i];
            let frame = generateImage(art, true);
            gallery.appendChild(frame);
        }
        // data.forEach(art => {
        //     let frame = generateImage(art);
        //     gallery.appendChild(frame);
        // });
        setupLazyLoad();
    }

    function generateImage(art, lazy) {
        let container = document.createElement("div");
        container.classList.add(art.size);
        let img = document.createElement("img");
        img.src = placeholderSrc(art.width, art.height);
        if(lazy) {
            img.dataset.src = `images/art/${art.path}`;
            img.classList.add("lazy");
        } else {
            img.src = `images/art/${art.path}`;
        }
        img.alt = art.name;
        img.addEventListener("click", openModal);
        let title = document.createElement("h2");
        title.textContent = art.name;
        let hr = document.createElement("hr");
        let date = document.createElement("p");
        date.textContent = art.date;

        container.appendChild(img);
        container.appendChild(title);
        container.appendChild(hr);
        container.appendChild(date);

        return container;
    }

    function setupLazyLoad() {
        let lazyloadImages = document.querySelectorAll(".lazy");
        if ("IntersectionObserver" in window) {
            let observer = new IntersectionObserver(onIntersect);
            lazyloadImages.forEach(image => {observer.observe(image);});
        } else {
            for(let i = 0; i < lazyloadImages.length; i++) {
                lazyloadImages[i].src = image.dataset.src;
            }
        }
    }

    function onIntersect(entries, observer) {
        entries.forEach( entry => {
          if (entry.isIntersecting) {
              let image = entry.target;
              image.src = image.dataset.src;
              image.classList.remove("lazy");
              observer.unobserve(image);
          }
        });
    }

    function openModal() {
        let modal = qs(".modal");
        let img = modal.querySelector("img");
        img.src = this.src;
        img.alt = this.alt;
        modal.classList.remove("hidden");
    }

    function checkStatus(response) {
        if(response.ok) {
            return response;
        } else {
            throw Error("Error in request: " + response.statusText);
        }
    }

    function placeholderSrc(width, height) {
        return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${height}px" viewBox="0 0 ${width} ${height}"%3E%3C/svg%3E`
    }
})();