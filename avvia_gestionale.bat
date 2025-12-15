@echo off
echo ---------------------------------------------------
echo    AVVIO GESTIONALE CLIENTI
echo ---------------------------------------------------
echo.
echo Sto avviando il server... attendi qualche secondo.
echo Una volta pronto, il browser si aprira' automaticamente.
echo.
echo NOTA: Non chiudere questa finestra nera mentre usi il programma.
echo.

:: Apre il browser (aspetta 3 secondi per dare tempo al server di inizializzare)
timeout /t 5 >nul
start http://localhost:3000

:: Avvia il server Next.js
npm run dev
