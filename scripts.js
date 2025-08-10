// -------- GLOBALS --------

const state = {
    mainUser: null,
    friends: [],
    quote: '',
    pokemon: null,
    about: '',
};

const el = {
    firstRow: document.getElementById('firstRow'),
    leftCol: document.getElementById('leftCol'),
    rightCol: document.getElementById('rightCol'),
    lastRow: document.getElementById('lastRow'),
    saveBtn: document.getElementById('saveBtn'),
    clearBtn: document.getElementById('clear'),
    loadDropdown: document.getElementById('loadDropdown'),
    loadPanel: document.getElementById('loadMenuPanel'),
    friendsDropdown: document.getElementById('friendsDropdown'),
    friendsPanel: document.getElementById('friendsMenuPanel'),
};

const STORAGE_KEY = 'savedSnapshots';


// -------- MODEL --------
async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function getRandomUsers() {
    const data = await fetchJson('https://randomuser.me/api/?results=7&inc=name,location,picture');
    const users = data.results;
    const firstUser = {
        picture: users[0].picture.large,
        firstName: users[0].name.first,
        lastName: users[0].name.last,
        city: users[0].location.city,
        state: users[0].location.state
    };
    const otherUsers = users.slice(1).map(user => ({
        firstName: user.name.first,
        lastName: user.name.last
    }));
    return { firstUser, otherUsers };
}

async function getQuote(){
    const data = await fetchJson('https://api.kanye.rest/');
    const quote = data.quote;
    return quote;
}

async function getRandomPokemon() {
    const maxPokemonId = 1025;
    const randomId = Math.floor(Math.random() * maxPokemonId) + 1;

    const data = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const pokemon = {
        name: data.name,
        photo: data.sprites.front_default
    };
    return pokemon;
}

async function getAbout(){
    try{
        const data = await fetchJson('https://baconipsum.com/api/?type=meat-and-filler');
        const about = data[0];
        return about;
    }
    catch (error) {
        console.error('Error fetching quote:', error.message);
        return null;
    }
}

async function modal() {
    const [users, quote, pokemon, about] = await Promise.all([
        getRandomUsers(),
        getQuote(),
        getRandomPokemon(),
        getAbout()
    ]);
    return { users, quote, pokemon, about };
}

// ---------- VIEW ----------
const View = {
  setError(msg){ console.error(msg); },
  renderProfile(mainUser) {
    const borderImage = document.createElement('div');
    borderImage.className = 'border-image';

    const profileImgShape = document.createElement('div');
    profileImgShape.className = 'shape-profile';

    const profileImg = document.createElement('img');
    profileImg.className = 'profile-picture';
    profileImg.src = mainUser.picture;

    profileImgShape.appendChild(profileImg);
    borderImage.appendChild(profileImgShape);

    const profileName = document.createElement('h1');
    profileName.className = 'profile-name';
    profileName.textContent = `${mainUser.firstName} ${mainUser.lastName}`;

    const profileLocation = document.createElement('h3');
    profileLocation.className = 'profile-location';
    profileLocation.textContent = `${mainUser.state}, ${mainUser.city}`;

    el.firstRow.append(borderImage, profileName, profileLocation);
  },
  renderQuote(q) {
    const h = document.createElement('h5');
    h.className = 'quoto-header';
    h.textContent = 'Favorite Quote:';
    const p = document.createElement('p');
    p.className = 'quoto';
    p.textContent = `“ ${q} ”`;
    el.leftCol.append(h, p);
  },
  renderPokemon(pokemon) {
    const h = document.createElement('h5');
    h.className = 'pokemon-header';
    h.textContent = 'Favorite Pokemon:';

    const wrap = document.createElement('div');
    wrap.className = 'pokemon-div';

    const name = document.createElement('p');
    name.className = 'pokemon-name';
    name.textContent = `${pokemon.name}:`;

    const img = document.createElement('img');
    img.className = 'pokemon-image';
    img.src = pokemon.photo;

    wrap.append(name, img);
    el.rightCol.append(h, wrap);
  },
  renderAbout(text) {
    const h = document.createElement('h4');
    h.className = 'about-header';
    h.textContent = 'About';

    const p = document.createElement('p');
    p.className = 'about-text';
    p.textContent = text;

    el.lastRow.append(h, p);
  },
};
// ---------- CONTROLLER ----------
async function controller() {
  try {
    const { users, quote, pokemon, about } = await modal();

    state.mainUser = users.firstUser;
    state.friends  = users.otherUsers;
    state.quote    = quote;
    state.pokemon  = pokemon;
    state.about    = about;

    View.renderProfile(state.mainUser);
    View.renderQuote(state.quote);
    View.renderPokemon(state.pokemon);
    View.renderAbout(state.about);

    renderFriendsMenu(el.friendsPanel, state.friends);
    renderLoadMenuFromStorage();

    el.saveBtn.addEventListener('click', () => {
        try {
            saveSnapshot();
            renderLoadMenuFromStorage();
        } catch (err) {
            View.setError(err.message);
        }
    });

    el.clearBtn.addEventListener('click', clearLocalUsers);


    el.loadPanel.addEventListener('click', (e) => {
        const item = e.target.closest('.menu-item');
        if (!item || item.classList.contains('is-static')) return;

        const idx = Number(item.dataset.index);
        const saves = readAllSnapshots();
        const chosen = saves[idx];
        if (!chosen) return;

        state.mainUser = chosen.users.firstUser;
        state.friends  = chosen.users.otherUsers;
        state.quote    = chosen.quote;
        state.pokemon  = chosen.pokemon;
        state.about    = chosen.about;

        rebuildView();
        renderFriendsMenu(el.friendsPanel, state.friends);
    });
    

  } catch (err) {
    View.setError(err.message);
  }
}


// ---------- HELPERS ----------
function renderFriendsMenu(panel, friends){
  panel.innerHTML = '';
  friends.forEach((f) => {
    const item = document.createElement('div');
    item.className = 'menu-item is-static';
    item.textContent = `${f.firstName} ${f.lastName}`;
    panel.appendChild(item);
  });
}

function buildSnapshotFromState() {
  return {
    users: {
      firstUser: state.mainUser,
      otherUsers: state.friends
    },
    quote: state.quote,
    pokemon: state.pokemon,
    about: state.about
  };
}

function readAllSnapshots() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function clearLocalUsers() {
    localStorage.removeItem(STORAGE_KEY);
    renderLoadMenuFromStorage();
}

function saveSnapshot() {
    if (!state.mainUser || !state.pokemon || !state.quote || !state.about) {
        throw new Error('Cannot save — data not loaded yet.');
    }

    const snapshots = readAllSnapshots();
    snapshots.push(buildSnapshotFromState());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
    return true;
}

function renderLoadMenuFromStorage() {
    const panel = el.loadPanel;
    panel.innerHTML = '';
    const saves = readAllSnapshots();

    if (!saves.length) {
        const empty = document.createElement('div');
        empty.className = 'menu-item is-static';
        empty.textContent = 'No saved users yet';
        panel.appendChild(empty);
        return;
  }

  saves.forEach((snap, i) => {
    const btn = document.createElement('button');
    btn.className = 'menu-item';
    const u = snap?.users?.firstUser;
    btn.textContent = u ? `${u.firstName} ${u.lastName}` : `Save #${i + 1}`;
    btn.dataset.index = String(i);
    panel.appendChild(btn);
  });
}

function rebuildView() {
    el.firstRow.innerHTML = '';
    el.leftCol.innerHTML  = '';
    el.rightCol.innerHTML = '';
    el.lastRow.innerHTML  = '';

    View.renderProfile(state.mainUser);
    View.renderQuote(state.quote);
    View.renderPokemon(state.pokemon);
    View.renderAbout(state.about);
    renderFriendsMenu(el.friendsPanel, state.friends);
}

// Start
controller();
