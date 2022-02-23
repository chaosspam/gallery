'use strict';
(function () {
  window.addEventListener('load', init);

  const id = document.getElementById.bind(document);
  const qs = document.querySelector.bind(document);
  const qsa = document.querySelectorAll.bind(document);
  const gen = document.createElement.bind(document);

  let currentAlbum = null;
  let albumIndex = 0;

  function init() {
    const modal = qs('.art-modal');
    requestImages();
    modal.addEventListener('mousemove', handleModalHover);
    modal.addEventListener('click', handleModalClick);
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
      img.dataset.fullsrc = `images/art/${art.path}.png`;
      img.dataset.src = `images/downsized/${art.path}.webp`;
      img.classList.add('lazy');
    } else {
      img.src = `images/downsized/${art.path}.webp`;
    }
    img.alt = art.name;
    img.addEventListener('click', () => openModal(art, img));
    img.addEventListener('mouseover', useFullRes);

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

  function useFullRes() {
    this.src = this.dataset.fullsrc;
  }

  function openModal(art, galleryArt) {
    galleryArt.src = `images/art/${art.path}.png`;

    const modal = qs('.art-modal');
    modal.scrollTop = 0;
    modal.scrollLeft = 0;
    const img = modal.querySelector('img');
    img.alt = art.name;

    if(art.album) {
      albumIndex = 0;
      currentAlbum = art.album;
      qs('.album-counter').classList.remove('hidden');
      img.src = `images/art/${art.album[albumIndex]}.png`;

    } else {
      currentAlbum = null;
      qs('.album-counter').classList.add('hidden');
      img.src = `images/art/${art.path}.png`;
    }

    const modalDesc = qs('.art-modal__desc');
    const title = modalDesc.querySelector('.art__title');
    title.textContent = art.name;
    const date = modalDesc.querySelector('.art__date');
    date.textContent = art.date;

    modal.classList.remove('hidden');

    document.body.style.overflow = 'hidden';
  }

  function prevAlbumImg() {
    if(!currentAlbum) {
      closeModal();
      return;
    }

    albumIndex--;
    if(albumIndex < 0) { albumIndex = currentAlbum.length - 1; }
    id('albumCount').textContent = `${albumIndex + 1} / ${currentAlbum.length}`;
    const img = qs('.art-modal img');
    img.src = `images/art/${currentAlbum[albumIndex]}.png`;
  }

  function nextAlbumImg() {
    if(!currentAlbum) {
      closeModal();
      return;
    }

    albumIndex++;
    if(albumIndex > currentAlbum.length - 1) { albumIndex = 0; }
    id('albumCount').textContent = `${albumIndex + 1} / ${currentAlbum.length}`;
    const img = qs('.art-modal img');
    img.src = `images/art/${currentAlbum[albumIndex]}.png`;
  }

  const ALBUM_HOVER_RATIO = 0.2;

  function handleModalHover(e) {
    if(currentAlbum === null) { return; }

    const height = window.innerHeight * ALBUM_HOVER_RATIO;
    if(e.clientY < height) {
      id('prevBtn').classList.add('active');
      id('nextBtn').classList.remove('active');
    } else if (e.clientY < window.innerHeight - height) {
      id('prevBtn').classList.remove('active');
      id('nextBtn').classList.remove('active');
    } else {
      id('prevBtn').classList.remove('active');
      id('nextBtn').classList.add('active');
    }
  }

  function handleModalClick(e) {
    if(currentAlbum === null) { return closeModal(); }

    const height = window.innerHeight * ALBUM_HOVER_RATIO;
    this.scrollTop = 0;
    if(e.clientY < height) {
      prevAlbumImg();
    } else if (e.clientY < window.innerHeight - height) {
      closeModal();
    } else {
      nextAlbumImg();
    }
  }

  function closeModal() {
    const modal = qs('.art-modal');
    modal.classList.add('hidden');
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