@echo off
title ProForm — Démarrage Complet
color 0A
cls
echo.
echo  ╔═══════════════════════════════════════════════════╗
echo  ║             ProForm.COM                          ║
echo  ║      Plateforme Arts Algeriens                    ║
echo  ╚═══════════════════════════════════════════════════╝
echo.
echo  [1/3] Démarrage du backend Express (port 5000)...
start "ProForm Backend" cmd /k "cd /d C:\Users\DELL\ART2\backend && node server.js"
timeout /t 3 /nobreak > nul

echo  [2/3] Ouverture du panel Admin...
start "" "C:\Users\DELL\ART2\admin.html"
timeout /t 1 /nobreak > nul

echo  [3/3] Ouverture du site principal...
start "" "C:\Users\DELL\ART2\index.html"

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   ✅  ProForm EST LANCÉ !
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   Site principal  :  file:///C:/Users/DELL/ART2/index.html
echo   Panel Admin     :  file:///C:/Users/DELL/ART2/admin.html
echo   Backend API     :  http://localhost:5000/api/health
echo.
echo   MOT DE PASSE ADMIN : Admin@2026
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   ⚠️  MONGODB ATLAS — CORRECTION MOT DE PASSE :
echo.
echo   1. Ouvrez  cloud.mongodb.com
echo   2. Database Access -^> Edit proformdz_db_user
echo   3. Edit Password -^> tapez : ProForm2026!
echo   4. Update User -^> attendez 30 secondes
echo   5. Lancez dans le terminal Backend :
echo      node seed.js
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
