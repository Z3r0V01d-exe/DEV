# ⚡ INSTALLATION & SETUP GUIDE

If you see an error like "npm: command not found", follow these steps:

## 🔍 CHECK IF NODE.JS IS INSTALLED

Open PowerShell and run:
```powershell
node --version
npm --version
```

If you see version numbers, Node.js is installed ✓

## 📥 INSTALL NODE.JS (If Not Installed)

1. Visit: https://nodejs.org
2. Download LTS version (14.0.0 or higher)
3. Run the installer
4. Follow the installation wizard (use default settings)
5. Restart your computer
6. Verify installation (run commands above)

## ✅ VERIFY REACT PROJECT IS SET UP

In the Subject #2 folder, you should have:
- package.json ✓
- vite.config.js ✓
- src/ folder ✓
- node_modules/ folder (might be hidden)

## 🚀 START THE PROJECT

### Method 1: Using VS Code Terminal (Recommended)

1. Open VS Code
2. Open the Subject #2 folder
3. Press Ctrl+` (backtick) to open terminal
4. Run:
   ```bash
   npm install
   npm run dev
   ```

### Method 2: Using Command Prompt/PowerShell

1. Press Windows Key + R
2. Type: cmd
3. Navigate to folder:
   ```bash
   cd "c:\Users\ADMIN\Desktop\OJT\DEV\Subject #2"
   ```
4. Run:
   ```bash
   npm install
   npm run dev
   ```

## 🌐 OPEN IN BROWSER

After running `npm run dev`, you'll see output like:

```
VITE v5.0.8  ready in 345 ms

➜  Local:   http://localhost:3000/
➜  press h to show help
```

Click on the http://localhost:3000/ link or copy-paste it into your browser.

## ✨ YOU'RE ALL SET!

The form should now be live in your browser with live reload enabled.

### Make changes and they'll appear instantly! 🎉

## 🔧 COMMON ISSUES & SOLUTIONS

### Issue: "Error: ENOENT: no such file or directory"

**Cause**: package.json not found  
**Solution**: Make sure you're in the correct directory:
```bash
cd "c:\Users\ADMIN\Desktop\OJT\DEV\Subject #2"
dir
```
You should see: package.json, vite.config.js, src folder

### Issue: "npm ERR! code ERESOLVE"

**Cause**: Dependency conflict  
**Solution**: Clear and reinstall:
```bash
rmdir node_modules /s /q
del package-lock.json
npm install
```

### Issue: "Error listening on port 3000"

**Cause**: Port 3000 already in use  
**Solution**: Use different port:
```bash
npm run dev -- --port 3001
```
Then go to: http://localhost:3001/

### Issue: "Cannot find module 'react'"

**Cause**: node_modules not installed  
**Solution**: Run:
```bash
npm install
```

### Issue: Blank page / 404 error

**Cause**: Dev server not running properly  
**Solution**: 
1. Stop server (Ctrl+C)
2. Run: `npm install`
3. Run: `npm run dev`
4. Clear browser cache (Ctrl+Shift+Delete)
5. Refresh page (F5)

## 📚 HELPFUL LINKS

- Node.js Download: https://nodejs.org
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev
- npm Help: https://npmjs.com

## ✓ FINAL CHECKLIST

Before using the app, make sure:

- [ ] Node.js is installed (check: `node --version`)
- [ ] You're in the correct folder
- [ ] package.json exists in the folder
- [ ] npm install completed successfully
- [ ] npm run dev is running (check for "Local: http://localhost:3000/")
- [ ] Browser shows the registration form
- [ ] You can fill out form fields
- [ ] No console errors (F12 → Console tab)

## 🎯 NEXT STEPS

Once everything is running:

1. Test the form by filling it out
2. Try adding/deleting entries
3. Review validation by clicking PROCEED with missing fields
4. Test the complete workflow (Application → Review → Confirmation)
5. Read README-REACT.md for more features

## 💪 YOU'VE GOT THIS!

If you run into any issues:
1. Check if Node.js is installed
2. Make sure you're in the correct folder
3. Run: `npm install` again
4. Clear browser cache and restart server
5. Check browser console for error messages (F12)

Good luck! 🚀
