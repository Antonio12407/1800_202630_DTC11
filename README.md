# Quaggle
 
## Overview
 
Quaggle is a mobile-friendly, client-side JavaScript web application that helps everyday media consumers learn to spot misinformation online. Each day, users take a short gamified quiz built on real examples of fake news, edited photos, and misleading statistics. After every question, they see whether they were right and why, so they build practical source-checking skills one day at a time. A daily streak, badges, and a progress screen encourage users to come back and make it a habit.
 
Developed for the COMP 1800 course, this project applies User-Centred Design practices and agile project management, and demonstrates integration with Firebase backend services for authentication and for storing users' streaks, quiz progress, and quiz history.
 
---
 
## Features
 
- Sign up, log in, and log out with Firebase Authentication
- A daily quiz of 5 multiple-choice questions based on real misinformation cases, rotated automatically each day from Firestore
- One quiz per day, with a "Completed Today" state once it's done
- A breakdown pop-up after each question showing the correct answer and an explanation
- Continue Quiz: leave partway through and pick up on the same question later, on any device
- Results screen with a Share results button, followed by a progress screen showing the updated streak and badge progress
- Daily streak that increases with the first quiz of the day and resets after a missed day
- Quiz history with a detailed breakdown of every past quiz, including wrong answers
- Profile page with streak, quizzes completed, and badges (First Quiz, Quiz Regular, Perfect Score)
- Copy your score or streak to the clipboard to share it
- Zoom in and zoom out buttons to change the question text size
- Settings page to edit your username and log out
- Responsive design for mobile and desktop
---
 
## Technologies Used
 
- **Frontend**: HTML, CSS, JavaScript, [Bootstrap 5](https://getbootstrap.com/), [Bootstrap Icons](https://icons.getbootstrap.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: Firebase Authentication
- **Database**: Firestore
---
 
## Usage
 
To run the application locally:
 
1.  **Clone** the repository.
2.  **Install dependencies** by running `npm install` in the project root directory.
3.  **Add your Firebase config** by creating a `.env` file in the project root with these values from your Firebase project settings:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```
4.  **Start the development server** by running the command: `npm run dev`.
5.  Open your browser and visit the local address shown in your terminal (usually `http://localhost:5173` or similar).
Once the application is running:
 
1.  Sign up for an account or log in.
2.  On the home page, press **Start Quiz** to begin today's quiz.
3.  Answer each question and read the breakdown to learn why the answer is right or wrong.
4.  After the last question, view your results, share them if you like, and press **Continue** to see your updated streak and badge progress.
5.  Visit your **Profile** to see your badges and open past quizzes from your quiz history.
6.  Come back tomorrow for a new quiz and keep your streak going!
---
 
## Project Structure
 
```
1800_202630_DTC11/
├── src/
│   ├── components/
│   │   └── site-navbar.js      # Shared navbar used on every page
│   ├── answerBreakdown.js      # Pop-up after each question
│   ├── authentication.js       # Sign-up, login, logout, user document setup
│   ├── badges.js               # Badge definitions and progress
│   ├── clipboard.js            # "Copied to clipboard!" pop-up
│   ├── continueQuiz.js         # Start Quiz / Continue Quiz button
│   ├── date.js                 # Current date display
│   ├── firebaseConfig.js       # Firebase setup (reads values from .env)
│   ├── history.js              # Quiz history page
│   ├── historyButton.js        # Quiz History button
│   ├── historyDetail.js        # Detailed breakdown of a past quiz
│   ├── loginSignup.js          # Login and sign-up forms
│   ├── main.js                 # Home page
│   ├── profile.js              # Profile page
│   ├── progress.js             # Progress screen (streak and badges)
│   ├── quiz.js                 # Quiz page
│   ├── quizHistory.js          # Save and read quiz history in Firestore
│   ├── quizProgress.js         # Save progress for Continue Quiz
│   ├── quizzes.js              # Load quizzes and pick today's quiz
│   ├── results.js              # Results screen
│   ├── saveHistory.js          # Save results when a quiz is finished
│   ├── settings.js             # Settings page
│   ├── shareResults.js         # Share buttons
│   ├── streak.js               # Daily streak and quiz limit
│   └── zoomTool.js             # Zoom in / zoom out buttons
├── styles/
│   ├── badges.css
│   ├── colors.css
│   ├── history.css
│   ├── progress.css
│   ├── quiz.css
│   └── results.css
├── images/
├── history.html
├── history-detail.html
├── index.html
├── login.html
├── main.html
├── profile.html
├── progress.html
├── quiz.html
├── results.html
├── settings.html
├── package-lock.json
├── package.json
└── README.md
```
 
---
 
## Contributors
 
- **Leo** - BCIT CST Student with a passion for computer science and golf. Fun fact: Has had 3 dogs.
- **Matthijs** - BCIT CST Student with a passion for coding and video games. Fun fact: His name is Dutch, but he is 0% Dutch.
- **Luis** - BCIT CST Student with a passion for videogames, F1, and football *(its football not soccer)*. Fun fact: The moon is not round and it doesn't emit light.
- **Kevin** - BCIT CST Student with a passion for game development. Fun fact: Loves basketball, billiards, and video games.
---
 
## Acknowledgments
 
- Quiz questions are based on real, publicly reported misinformation cases and are used for educational purposes only.
- Code snippets were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- Icons from [Bootstrap Icons](https://icons.getbootstrap.com/) and fonts from [Google Fonts](https://fonts.google.com/).
---
 
## Limitations and Future Work
 
### Limitations
 
- Only 3 quiz sets are available, so the daily quiz repeats every 3 days.
- Settings only supports changing your username and logging out; changing your email is not supported yet.
- Users can't re-attempt quizzes they got wrong.
- Accessibility features (contrast, default text size) can be further improved.
### Future Work
 
- Add more themed quizzes (our goal is 7) so users see new content for longer.
- Let users re-attempt failed quizzes to learn from their mistakes.
- Add a dark mode and email changes to Settings.
- Add more badges and streak rewards.
- Add a short "what to look for" tip after each explanation to help users build confidence spotting misinformation.
---
 
## License
 
This project is licensed under the MIT License. See the LICENSE file for details.
 