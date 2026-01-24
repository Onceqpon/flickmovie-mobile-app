<div align="center">

  <img src="https://via.placeholder.com/150/FF9C01/FFFFFF?text=FlickMovie" alt="FlickMovie Logo" width="150" height="150" style="border-radius: 20px" />

  <h1>🎬 FlickMovie</h1>
  
  <p>
    <strong>Wybieraj, Oglądaj, Oceniaj. Koniec z kłótniami o pilota!</strong>
  </p>

  <p>
    <a href="#funkcje">Funkcje</a> •
    <a href="#technologie">Technologie</a> •
    <a href="#galeria">Galeria</a> •
    <a href="#uruchomienie">Jak zacząć</a> •
    <a href="#licencja">Licencja</a>
  </p>

  <a href="https://github.com/twoja-nazwa/flickmovie/actions">
    <img src="https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square" alt="Build Status" />
  </a>
  <a href="https://reactnative.dev/">
    <img src="https://img.shields.io/badge/React_Native-v0.74+-blue?style=flat-square&logo=react" alt="React Native" />
  </a>
  <a href="https://appwrite.io/">
    <img src="https://img.shields.io/badge/Backend-Appwrite-f02e65?style=flat-square&logo=appwrite" alt="Appwrite" />
  </a>
  <a href="#licencja">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
  </a>
</div>

---

## 🍿 O projekcie

**FlickMovie** to nowoczesna aplikacja mobilna, która rozwiązuje odwieczny problem: *"Co dzisiaj oglądamy?"*. 

Dzięki integracji z **TMDB** oraz autorskiemu systemowi **Multiplayer**, aplikacja pozwala grupie znajomych (lub parze) wspólnie wybierać filmy w stylu "Tinderowym". Każdy przesuwa w prawo lub w lewo na swoim telefonie, a aplikacja pokazuje **Perfect Match** – film, który pasuje wszystkim. Oprócz tego FlickMovie to Twoje osobiste centrum filmowe z listami do obejrzenia, recenzjami i statystykami.

---

## 📸 Galeria (Screenshots)

| Ekran Główny | Tryb Multiplayer | Wyniki Głosowania | Szczegóły Filmu |
|:---:|:---:|:---:|:---:|
| <img src="https://via.placeholder.com/200x400?text=Home+Feed" width="200" /> | <img src="https://via.placeholder.com/200x400?text=Swipe+Card" width="200" /> | <img src="https://via.placeholder.com/200x400?text=Perfect+Match" width="200" /> | <img src="https://via.placeholder.com/200x400?text=Details" width="200" /> |

---

## 🚀 Kluczowe funkcje

### 🎮 Multiplayer "Movie Match"
* **System Lobby:** Tworzenie pokoi za pomocą kodu 6-cyfrowego.
* **Synchronizacja Real-time:** Wykorzystanie Appwrite Realtime do natychmiastowej aktualizacji stanu gry u wszystkich graczy.
* **Mechanika Swipe:** Intuicyjne przesuwanie kart (Prawo = Lubię, Lewo = Nie lubię).
* **Inteligentne Rundy:** Gra składa się z 4 rund, które dynamicznie filtrują filmy aż do znalezienia zwycięzcy.
* **Perfect Match:** Specjalne wyróżnienie, gdy wszyscy gracze wybiorą ten sam tytuł.

### 🎬 Baza Wiedzy i Discovery
* **Trending:** Najpopularniejsze filmy i seriale dnia/tygodnia (API TMDB).
* **Szczegóły:** Obsada, zwiastuny, oceny, platformy streamingowe (gdzie obejrzeć).
* **Szukajka:** Zaawansowane wyszukiwanie po gatunkach, aktorach i tytułach.

### 👤 Profil Użytkownika
* **Watchlisty:** Oddzielne listy "Do obejrzenia" dla filmów i seriali.
* **Listy Niestandardowe:** Tworzenie własnych kolekcji (np. "Horrory na Halloween").
* **Recenzje:** Możliwość pisania i czytania recenzji społeczności.
* **Historia Gier:** Zapis wyników wszystkich gier multiplayer.

---

## 🛠️ Stos Technologiczny

Aplikacja została zbudowana z naciskiem na wydajność, płynne animacje i skalowalny backend.

### Frontend (Mobile)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
* **Styling:** `NativeWind` (TailwindCSS dla React Native).
* **Animacje:** `React Native Reanimated` (płynne gesty swipe).
* **Nawigacja:** `Expo Router`.

### Backend & Dane
![Appwrite](https://img.shields.io/badge/Appwrite-FD366E?style=for-the-badge&logo=appwrite&logoColor=white)
![TMDB](https://img.shields.io/badge/TMDB_API-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)
* **Baza Danych:** Appwrite Database (Przechowywanie użytkowników, sesji gier, recenzji).
* **Realtime:** Appwrite Realtime (Obsługa lobby i synchronizacja głosów).
* **Storage:** Appwrite Storage (Awatar użytkownika).
* **Auth:** Appwrite Auth (Email/Hasło).

---

## 🏗️ Struktura Danych (Appwrite)

Główne kolekcje wykorzystywane w projekcie:
* `active_games`: Przechowuje stan lobby, pulę filmów i obecną rundę.
* `game_participants`: Gracze w danym lobby, ich statusy (ready) i głosy.
* `watchlist_movies` / `series`: Osobiste listy użytkowników.
* `reviews`: Oceny i opinie.

---

## 🏁 Uruchomienie (Getting Started)

### Wymagania
* Node.js (v18+)
* Konto w [Appwrite Cloud](https://cloud.appwrite.io/) lub własna instancja.
* Klucz API [TMDB](https://www.themoviedb.org/).

### Instalacja

1. **Sklonuj repozytorium**
   ```bash
   git clone [https://github.com/twoja-nazwa/flickmovie.git](https://github.com/twoja-nazwa/flickmovie.git)
   cd flickmovie
