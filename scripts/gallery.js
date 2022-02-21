'use strict';
(function () {
  window.addEventListener('load', init);

  const id = document.getElementById.bind(document);
  const qs = document.querySelector.bind(document);
  const qsa = document.querySelectorAll.bind(document);
  const gen = document.createElement.bind(document);

  function init() {
    const modal = qs('.art-modal');
    requestImages();
    modal.addEventListener('click', closeModal);
  }

  function requestImages() {
    fetch('data/gallery.json')
      .then(checkStatus)
      .then(res => res.json())
      .then(populateImages)
      .catch(console.error);

  }

  function populateImages(data) {
    const gallery = id('gallery');
    data.forEach(art => {
      const frame = generateImage(art, true);
      gallery.appendChild(frame);
    });
    setupLazyLoad();
  }

  function generateImage(art, lazy) {
    const container = gen('div');
    container.classList.add('gallery__art');
    container.classList.add(`art-size--${art.size}`);

    const img = gen('img');
    img.classList.add('art');
    img.src = placeholderSrc(art.width, art.height, art);
    img.width = art.width;
    img.height = art.height;
    if (lazy) {
      img.dataset.src = `images/downsized/${art.path}.webp`;
      img.classList.add('lazy');
    } else {
      img.src = `images/downsized/${art.path}.webp`;
    }
    img.alt = art.name;
    img.addEventListener('click', () => openModal(art, img));

    const desc = gen('div');
    desc.classList.add('art__desc');

    const title = gen('h2');
    title.classList.add('art__title');
    title.textContent = art.name;

    const hr = gen('hr');

    const date = gen('p');
    date.classList.add('art__date');
    date.textContent = art.date;

    desc.appendChild(title);
    desc.appendChild(hr);
    desc.appendChild(date);

    container.appendChild(img);
    container.appendChild(desc);

    return container;
  }

  function setupLazyLoad() {
    const lazyloadImages = document.querySelectorAll('.lazy');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(onIntersect);
      lazyloadImages.forEach(image => { observer.observe(image); });
    } else {
      for (let i = 0; i < lazyloadImages.length; i++) {
        lazyloadImages[i].src = image.dataset.src;
      }
    }
  }

  function onIntersect(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = image.dataset.src;
        image.classList.remove('lazy');
        observer.unobserve(image);
      }
    });
  }

  function openModal(art, galleryArt) {

    galleryArt.src = `images/art/${art.path}.png`;

    const modal = qs('.art-modal');
    const img = modal.querySelector('img');
    img.src = `images/art/${art.path}.png`;
    img.alt = art.name;

    const modalDesc = qs('.art-modal__desc');
    const title = modalDesc.querySelector('.art__title');
    title.textContent = art.name;
    const date = modalDesc.querySelector('.art__date');
    date.textContent = art.date;

    modal.classList.remove('hidden');

    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    this.classList.add('hidden');
    const modal = qs('.art-modal');
    const img = modal.querySelector('img');
    img.src = '';
    img.alt = '';
    document.body.style.overflow = '';
  }

  function checkStatus(response) {
    if (response.ok) {
      return response;
    } else {
      throw Error('Error in request: ' + response.statusText);
    }
  }

  function placeholderSrc(width, height) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}px' height='${height}px' viewBox='0 0 ${width} ${height}'%3E%3C/svg%3E`
  }
})();