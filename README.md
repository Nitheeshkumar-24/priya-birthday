# 🎂 Happy Birthday Priyadarshini - Birthday Website

A beautiful, animated birthday surprise website built with Flask!

## Features
- 🌥️ Animated cloud scene — click clouds to make them pop!
- 🎂 Birthday card with animated boy giving a rose bouquet
- 💌 Interactive envelope that opens to reveal a personal letter
- 📖 Flip-through photo book with 18 photo slots
- 🎉 Confetti, floating emojis & colorful animations throughout

## Setup & Run

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the app
```bash
python app.py
```

### 3. Open in browser
Visit: http://127.0.0.1:5000

## Adding Your Photos
Place your photos in `static/images/` and update the `photoSlot()` function
in `static/js/main.js` to reference them by filename.

## Deploy to SnapDeploy
1. Push this folder to a GitHub repository
2. Connect the repo on SnapDeploy
3. Set start command: `python app.py`
4. Done! 🚀

## Project Structure
```
birthday_app/
├── app.py              # Flask server
├── requirements.txt    # Python dependencies
├── templates/
│   └── index.html      # Main HTML page
└── static/
    ├── css/
    │   └── style.css   # All styles & animations
    ├── js/
    │   └── main.js     # All interactions & logic
    └── images/         # Add your photos here
```
