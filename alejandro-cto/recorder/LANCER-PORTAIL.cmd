@echo off
cd /d "%~dp0"
title Ghost - Compagnon du portail
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" portail.py
) else (
  py -3 portail.py
)
echo.
echo Le compagnon Ghost est arrete. Vous pouvez fermer cette fenetre.
pause
