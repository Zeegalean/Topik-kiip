# របៀបវេចខ្ចប់ និងដំឡើង KIIP & TOPIK App លើកុំព្យូទ័រ PC (Windows)

## ⚠️ មូលហេតុ និងវិធីដោះស្រាយកំហុស `npm error Missing script: "build"`
ប្រសិនបើលោកអ្នកជួបកំហុស `npm error Missing script: "build"` នោះគឺមកពី Command Prompt (CMD) កំពុងស្ថិតនៅ Folder ដើមរបស់ Windows (ដូចជា `C:\Users\EANG VEASNA>`) មិនទាន់បានចូលទៅក្នុង Folder គម្រោងដែលមាន File `package.json` ឡើយ។

---

### 🚀 វិធីទី ១ ៖ ប្រើ File ស្វ័យប្រវត្តិ (Double-Click លើ BUILD_EXE.bat - ងាយស្រួលបំផុត ១០០%)
ដើម្បីកុំឱ្យពិបាកវាយកូដ ឬភាន់ច្រឡំ Folder៖
1. សូមចូលទៅកាន់ Folder ដែលបានពន្លា (Extract)
2. **Double-click លើ File `BUILD_EXE.bat`**
3. ប្រព័ន្ធនឹងដំឡើង packages, build web, និងវេចខ្ចប់ចេញជា **`KIIP-TOPIK-App.exe`** ដោយស្វ័យប្រវត្តិ ហើយបើក Folder ដែលមាន file .exe ជូនអ្នកភ្លាមៗ!

---

### 💻 វិធីទី ២ ៖ បើក CMD ឱ្យចំ Folder គម្រោង (ប្រសិនបើចង់វាយ Command ដោយដៃ)
1. បើក File Explorer ចូលទៅកាន់ Folder គម្រោងដែលមានឃើញ file `package.json`, `index.html`
2. ចុចលើរបារ Address ខាងលើនៃ Folder នោះ រួចវាយអក្សរ `cmd` ហើយចុច `Enter` (វានឹងបើក CMD ចំ Folder នោះតែម្ដង)
3. វាយបញ្ជា៖
```bash
npm install
npm install --save-dev electron electron-packager
npm run build
npx electron-packager . "KIIP-TOPIK-App" --platform=win32 --arch=x64 --out=dist-pc --overwrite --icon=public/favicon.ico
```

---

### ⚡ វិធីទី ៣ ៖ រត់ប្រើលើកុំព្យូទ័រ PC ភ្លាមៗ (RUN_PC.bat)
- គ្រាន់តែ **Double-click លើ File `RUN_PC.bat`** នោះកម្មវិធីនឹងដំណើរការលើ PC របស់អ្នកតាមរយៈ `http://localhost:3000` ភ្លាមៗ!
