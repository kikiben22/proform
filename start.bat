@echo off
title ProForm — Démarrage
color 0A
cls
echo.
echo  ╔═══════════════════════════════════════╗
echo  ║         ProForm.COM                  ║
echo  ║    Plateforme des Arts Algériens       ║
echo  ╚═══════════════════════════════════════╝
echo.

:: Démarrer le backend dans une nouvelle fenêtre
echo  [1/2] Démarrage du backend (port 5000)...
start "ProForm Backend" cmd /k "cd /d C:\Users\DELL\ART2\backend && node server.js"

:: Attendre 3 secondes que le backend démarre
timeout /t 3 /nobreak > nul

:: Ouvrir le site dans le navigateur
echo  [2/2] Ouverture du site...
start "" "C:\Users\DELL\ART2\index.html"

echo.
echo  ✅ ProForm démarré !
echo     Backend : http://localhost:5000
echo     Site    : C:\Users\DELL\ART2\index.html
echo     Admin   : C:\Users\DELL\ART2\admin.html
echo.
echo  Pour arrêter le backend, fermez la fenêtre "ProForm Backend"
echo.
pause
