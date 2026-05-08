// Funzione temporanea per simulare l'accesso dell'arbitro
function login() {
    const code = document.getElementById('referee-code').value;
    
    if (code !== "") {
        // Nasconde la schermata di login e mostra la dashboard
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
    } else {
        alert("Inserisci un codice valido per accedere.");
    }
}

// Funzione che cambia i campi del punteggio in base allo sport
function cambiaCampiSport() {
    const sportScelto = document.getElementById('sport-type').value;
    const campiCalcio = document.getElementById('campi-calcio');
    const campiPallavolo = document.getElementById('campi-pallavolo');

    if (sportScelto === 'calcio') {
        campiCalcio.classList.remove('hidden');
        campiPallavolo.classList.add('hidden');
    } else if (sportScelto === 'pallavolo') {
        campiPallavolo.classList.remove('hidden');
        campiCalcio.classList.add('hidden');
    }
}

// Simulazione salvataggio
function salvaRisultato() {
    alert("Risultato salvato con successo! (In futuro questo dato andrà nel database)");
}
