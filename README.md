<div align="center">

  <img width="150" height="150" style="border-radius: 20px" alt="FlickMovie Logo" src="https://github.com/user-attachments/assets/1cf16398-c3e2-4f8f-8ec7-3322655107b1" />

  <h1>🎬 FlickMovie</h1>
  
  <p>
    <strong>Wybieraj, Oglądaj, Oceniaj. Koniec z kłótniami o pilota!</strong>
  </p>

  <p>
    <a href="#-o-projekcie">O projekcie</a> •
    <a href="#-kluczowe-funkcje">Funkcje</a> •
    <a href="#%EF%B8%8F-stos-technologiczny">Technologie</a> •
    <a href="#%EF%B8%8F-struktura-bazy-danych-appwrite">Baza Danych</a> •
    <a href="#-uruchomienie-getting-started">Jak zacząć</a>
  </p>

  <img src="https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square" alt="Build Status" />
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

| Ekran Główny | Tryb Multiplayer | Wyniki Głosowania |
|:---:|:---:|:---:|
| <img width="365" height="759" alt="main" src="https://github.com/user-attachments/assets/fb48746d-3b5f-4ecc-9934-399ffe780f7d" /> | <img width="365" height="759" alt="lobby" src="https://github.com/user-attachments/assets/a3652e00-a2a0-4f09-a23d-d8b3917e7dc3" /> | <img width="365" height="759" alt="wynik" src="https://github.com/user-attachments/assets/828ad569-62cf-4ed6-af9c-1199024b9bf1" /> |

| Szczegóły Filmu |
|:---:|
| <img width="300" height="759" alt="detail" src="https://github.com/user-attachments/assets/1fcee1a5-b211-48a0-a231-a8c1b5e5e363" /> |



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

## 🏗️ Struktura Bazy Danych (Appwrite)

Aplikacja opiera się na relacyjnej strukturze dokumentów w Appwrite. Poniżej znajduje się opis kluczowych kolekcji:

| Kolekcja | ID Kolekcji | Opis i Kluczowe Pola |
| :--- | :--- | :--- |
| **Active Games** | `active_games` | Zarządza stanem gry w czasie rzeczywistym.<br>🔑 `game_code`, `host_id`, `status` (lobby/in_progress), `round_current`, `movies_pool` (JSON). |
| **Game Participants** | `game_participants` | Gracze w aktywnym lobby.<br>🔑 `game_id`, `user_id`, `is_ready`, `votes` (JSON z głosami z rund), `selected_genres`. |
| **Watchlist Movies** | `watchlist` | Filmy zapisane przez użytkownika.<br>🔑 `user_Id`, `movie_id`, `title`, `poster_path`. |
| **Watchlist Series** | `watchlistseries` | Seriale zapisane przez użytkownika.<br>🔑 `user_id`, `series_id`, `name`, `first_air_date`. |
| **Reviews** | `reviews` | Oceny i recenzje użytkowników.<br>🔑 `user_id`, `movie_id` / `series_id`, `rating` (1-5), `content`. |
| **Game History** | `game_history` | Archiwum zakończonych rozgrywek.<br>🔑 `user_id`, `items` (JSON ze zwycięskimi filmami), `game_mode`. |
| **Trending Searches** | `trending...` | Cache dla najczęściej wyszukiwanych fraz.<br>🔑 `movie_id` / `series_id`, `count` (licznik wyszukiwań). |

---

## 🏁 Uruchomienie (Getting Started)

### Wymagania wstępne
* [Node.js](https://nodejs.org/) (wersja LTS)
* Konto w [Appwrite Cloud](https://cloud.appwrite.io/) (lub lokalna instancja)
* Klucz API z [TMDB](https://www.themoviedb.org/)
* Aplikacja **Expo Go** na telefonie (Android/iOS)

### Instalacja

1. **Sklonuj repozytorium**
   ```bash
   git clone [https://github.com/twoja-nazwa/flickmovie.git](https://github.com/twoja-nazwa/flickmovie.git)
   cd flickmovie

2. **Zainstaluj zależności**
   ```bash
   npm install
   # lub
   yarn install
   
4. **Skonfiguruj zmienne środowiskowe Utwórz plik .env w głównym katalogu:**
   ```bash
   # Konfiguracja Appwrite
    EXPO_PUBLIC_APPWRITE_ENDPOINT=[https://cloud.appwrite.io/v1](https://cloud.appwrite.io/v1)
    EXPO_PUBLIC_APPWRITE_PROJECT_ID=twoje_project_id
    EXPO_PUBLIC_APPWRITE_FLICKMOVIEDATABASE_ID=twoje_database_id
    EXPO_PUBLIC_APPWRITE_STORAGE_ID=twoje_bucket_id
    
    # API TMDB
    EXPO_PUBLIC_TMDB_API_KEY=twoj_klucz_tmdb
    
    # ID Kolekcji (Skopiuj z Appwrite Database)
    EXPO_PUBLIC_APPWRITE_ACTIVE_GAMES_COLLECTION_ID=...
    EXPO_PUBLIC_APPWRITE_GAME_PARTICIPANTS_COLLECTION_ID=...
    EXPO_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID=...
    EXPO_PUBLIC_APPWRITE_WATCHLIST_SERIES_COLLECTION_ID=...
    EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID=...
    EXPO_PUBLIC_APPWRITE_GAME_HISTORY_COLLECTION_ID=...
    EXPO_PUBLIC_APPWRITE_LISTS_COLLECTION_ID=...
    EXPO_PUBLIC_APPWRITE_REPORT_COLLECTION_ID=...
    
    # Kolekcje Trending (opcjonalne)
    EXPO_PUBLIC_APPWRITE_COLLECTION_ID=... (Trending Movies)
    EXPO_PUBLIC_APPWRITE_SERIES_COLLECTION_ID=... (Trending Series)
   
6. **Uruchom projekt**
   ```bash
   npx expo start

## 📄 Licencja
Projekt udostępniany na licencji MIT.
<div align="center"> <br /> <sub>Stworzone przez Onceqpon</sub> </div>
