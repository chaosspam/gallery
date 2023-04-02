(function() {
  const id = document.getElementById.bind(document);
  const qs = document.querySelector.bind(document);
  const qsa = document.querySelectorAll.bind(document);
  const gen = document.createElement.bind(document);

  const DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR9CD06wlZv22oEuWESW7QneZLRMqknt5NEXnmF7UKhXikuS-hc6KSyAiSIgR0OoGz5lnSIWFTk6AwS/pub?output=csv'

  window.addEventListener('load', init);

  function init() {
    fetch(DATA_URL)
    .then(checkStatus)
    .then(res => res.text())
    .then(text => Papa.parse(text, {header: true}))
    .then(formatData)
    .then(populateSlots)
    .catch(console.error);
  }

  function populateSlots(data) {
    const container = id('slots');
    data.forEach(slot => {
      container.appendChild(generateSlot(slot));
    });
  }

  function formatData(parsed) {
    return parsed.data.map(item => {
      let res = {
        status: item.status,
      }
      if(item.commissioner && item.type && item.date) {
        res.info = {
          commissioner: item.commissioner,
          type: item.type,
          data: item.date
        }
      }
      return res;
  })
  }

  function generateSlot(slot) {
    const li = gen('li');
    li.textContent = slot.status;
    li.classList.add('slot', slot.status);

    const info = slot.info;

    if(info) {
      const desc = gen('div');
      desc.classList.add('art__desc');

      const title = gen('h2');
      title.classList.add('art__title');
      title.textContent = info.commissioner;

      const hr = gen('hr');

      const type = gen('p');
      type.classList.add('art__date');
      type.textContent = info.type;

      const date = gen('p');
      date.classList.add('art__date');
      date.textContent = info.date;

      desc.appendChild(title);
      desc.appendChild(hr);
      desc.appendChild(type);
      desc.appendChild(date);

      li.appendChild(desc);
    }

    return li;
  }

  function checkStatus(response) {
    if (response.ok) {
      return response;
    } else {
      throw Error('Error in request: ' + response.statusText);
    }
  }
})();