# RUPG Project

A simple **Random User Profile Generator** web app that fetches data from multiple public APIs and displays it in a clean UI.  
The app allows saving and loading profiles to/from local storage, clearing saved data, and viewing random friends, quotes, Pokémon, and "about me" text.

---

## 🚀 Features

- Fetches a **random main user** with profile image and location from the [RandomUser API](https://randomuser.me).
- Displays a **favorite quote** from the [Kanye REST API](https://api.kanye.rest/).
- Shows a **random Pokémon** from the [PokéAPI](https://pokeapi.co/).
- Generates random "About me" text from the [Bacon Ipsum API](https://baconipsum.com/).
- Save/load profiles to/from **localStorage**.
- Clear saved profiles with a single click.
- Responsive, beginner-friendly UI with a sticky menu bar.

---

## 🖼 Demo
<img width="1910" height="906" alt="image" src="https://github.com/user-attachments/assets/932eacd8-ddc5-492c-b313-1c61bf6eb407" />

---

## 📂 Project Structure

├── index.html # Main HTML structure
├── style.css # App styling
├── scripts.js # Main logic (MVC pattern)
└── bg.jpg # Background image


---

## ⚙️ How It Works

The project follows a **basic MVC (Model-View-Controller)** structure:

- **Model** – Manages state and API calls (`getRandomUsers`, `getQuote`, `getRandomPokemon`, `getAbout`).
- **View** – Renders UI components (`renderProfile`, `renderQuote`, `renderPokemon`, `renderAbout`).
- **Controller** – Coordinates fetching data, updating state, rendering views, and handling UI events.

---

## 📦 Installation & Running

1. **Clone the repository**
   ```bash
   git clone https://github.com/HaimFC/RUPG-Project
   cd rupg-project
