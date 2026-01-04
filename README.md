# YouTube Playlist Checker ✅

A lightweight browser extension that helps you **track which videos you’ve watched in a YouTube playlist** using an interactive checklist directly on the YouTube page.

Whether you’re following a course, a tutorial series, or a long playlist, this extension makes sure you never lose track.

---

## ✨ Features

- 📋 Interactive checklist for YouTube playlists
- 💾 Progress automatically saved using browser storage
- 🎯 Floating button UI on playlist pages 
- 🔓 Fully open-source and customizable
- 🌐 Works on **Firefox** and **Chromium-based browsers**

---

## 🦊 Firefox (Official Store)

You can install the extension directly from the Firefox Add-ons Store:

👉 **Firefox Add-on Link**  
https://addons.mozilla.org/en-US/firefox/addon/youtube-playlist-checker/

This version is reviewed and published officially on the Firefox store.

---

## 🌐 Chromium Browsers (Chrome, Brave, Edge)

The extension is **not published on the Chrome Web Store** yet.  
However, you can easily install it manually using **Developer Mode**.

### 🔧 Manual Installation (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/Aasthik17/youtube-playlist-checker.git
   ```

2. Open your Chromium-based browser and go to:
   ```
   chrome://extensions/
   ```

3. Enable **Developer mode** (top-right corner)

4. Click **Load unpacked**

5. Select the `chromium/` folder from the cloned repository

✅ The extension is now installed and ready to use!

> 🔁 After making code changes, click **Reload** on the extension card.

---

## 🧠 How to Use

1. Open any **YouTube playlist**
2. A floating **✓ button** will appear on the page
3. Click it to open the checklist
4. Mark videos as you watch them
5. Your progress is saved automatically

---

## 🗂️ Project Structure

```text
youtube-playlist-checker/
├── firefox/     → Firefox extension (Manifest V2)
├── chromium/    → Chromium extension (Manifest V3)
├── README.md
```

- `firefox/` → Source code used for Firefox Add-ons store
- `chromium/` → Compatible with Chrome, Brave, Edge (manual install)

---

## 🛠️ Customization & Development

- You are free to modify the code for your own needs
- All logic is written in plain JavaScript
- UI styles are handled via CSS
- Storage uses browser local storage

Feel free to fork the repo and experiment 🚀

---

## 🤝 Contributing

Contributions are welcome!

You can:
- Add new features
- Improve UI/UX
- Optimize performance

Just open a PR or issue.

---

## 📄 License

This project is licensed under the **MIT License**.

You’re free to use, modify, and distribute it.

---

## 🙌 Author

Built with ❤️ by **Aasthik**

If you found this useful, consider giving the repo a ⭐
