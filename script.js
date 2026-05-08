// Importiamo le funzioni base di Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// QUI È DOVE DEVI INCOLLARE LE TUE CHIAVI FIREBASE!
// Sostituisci i testi tra virgolette con i tuoi codici esatti
const firebaseConfig = {
  apiKey: "AIzaSyAnYEtwrhmjT3aJY4dk_vST32cOX-kPe_M",
  authDomain: "torneo-trisport-corridonia.firebaseapp.com",
  projectId: "torneo-trisport-corridonia",
  storageBucket: "torneo-trisport-corridonia.firebasestorage.app",
  messagingSenderId: "330248876134",
  appId: "1:330248876134:web:f8814eda23c8da91063da7"
};

// Inizializziamo Firebase e il Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funzione di Login
window.login = function() {
    const code = document.getElementById('referee-code').value;
    if (code !== "") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
    } else {
        alert("Inserisci un codice valido per accedere.");
    }
}

// Cambia i campi visibili in base allo sport
window.cambiaCampiSport = function() {
    const sportScelto = document.getElementById('sport-type').value;
    const campiPunti = document.getElementById('campi-punti');
    const campiPallavolo = document.getElementById('campi-pallavolo');

    if (sportScelto === 'pallavolo') {
        campiPallavolo.classList.remove('hidden');
        campiPunti.classList.add('hidden');
    } else {
        campiPallavolo.classList.add('hidden');
        campiPunti.classList.remove('hidden');
    }
}

// Mostra/Nascondi il menu a tendina se l'arbitro spunta la casella del pareggio
window.toggleSpareggio = function() {
    const isChecked = document.getElementById('check-spareggio').checked;
    const scelta = document.getElementById('scelta-vincitore');
    if (isChecked) {
        scelta.classList.remove('hidden');
    } else {
        scelta.classList.add('hidden');
    }
}

// SALVATAGGIO E CALCOLO PUNTI TORNEO
window.salvaRisultato = async function() {
    const sportScelto = document.getElementById('sport-type').value;
    const arbitro = document.getElementById('referee-code').value;
    const isSpareggio = document.getElementById('check-spareggio').checked;
    
    // Leggiamo i punteggi grezzi inseriti dall'arbitro
    let punteggioGrezzoA = sportScelto === 'pallavolo' ? parseInt(document.getElementById('set-a').value) : parseInt(document.getElementById('punti-a').value);
    let punteggioGrezzoB = sportScelto === 'pallavolo' ? parseInt(document.getElementById('set-b').value) : parseInt(document.getElementById('punti-b').value);

    // Controllo sicurezza: campi vuoti
    if (isNaN(punteggioGrezzoA) || isNaN(punteggioGrezzoB)) {
        alert("Inserisci i punteggi prima di salvare!");
        return;
    }

    // Variabili per i Punti Classifica Generali
    let puntiTorneoA = 0;
    let puntiTorneoB = 0;
    
    // Regole di punteggio base
    const puntiVittoriaNetta = (sportScelto === 'jolly') ? 4 : 3;
    const puntiVittoriaSpareggio = (sportScelto === 'jolly') ? 3 : 2;
    const puntiSconfittaSpareggio = 1;

    if (isSpareggio) {
        // Se c'è stato uno spareggio, leggiamo chi ha vinto dal menu a tendina
        const vincitoreSpareggio = document.getElementById('vincitore-spareggio').value;
        if (vincitoreSpareggio === "A") {
            puntiTorneoA = puntiVittoriaSpareggio;
            puntiTorneoB = puntiSconfittaSpareggio;
        } else {
            puntiTorneoA = puntiSconfittaSpareggio;
            puntiTorneoB = puntiVittoriaSpareggio;
        }
    } else {
        // Se non c'è stato spareggio, chi ha il numero più alto vince netto
        if (punteggioGrezzoA > punteggioGrezzoB) {
            puntiTorneoA = puntiVittoriaNetta;
            puntiTorneoB = 0;
        } else if (punteggioGrezzoB > punteggioGrezzoA) {
            puntiTorneoA = 0;
            puntiTorneoB = puntiVittoriaNetta;
        } else {
            alert("Hai inserito un pareggio! Spunta la casella 'Partita decisa dopo pareggio' e indica chi ha vinto.");
            return; // Blocca il salvataggio
        }
    }

    // Prepariamo il "pacco" di dati da spedire a Firebase
    let datiPartita = {
        torneo: "Trisport Corridonia",
        squadraA: "Squadra A",
        squadraB: "Squadra B",
        sport: sportScelto,
        codiceArbitro: arbitro,
        punteggioFinaleA: punteggioGrezzoA,
        punteggioFinaleB: punteggioGrezzoB,
        puntiTorneoGuadagnatiA: puntiTorneoA, // 3, 2, 1, 0, o 4
        puntiTorneoGuadagnatiB: puntiTorneoB,
        vintaDopoPareggio: isSpareggio,
        dataInserimento: new Date()
    };

    try {
        const docRef = await addDoc(collection(db, "risultati"), datiPartita);
        alert(`Salvato! La Squadra A prende ${puntiTorneoA} pt e la Squadra B prende ${puntiTorneoB} pt.`);
        
        // Reset dei campi per la partita successiva
        document.querySelectorAll('input[type="number"]').forEach(i => i.value = '');
        document.getElementById('check-spareggio').checked = false;
        toggleSpareggio();
    } catch (e) {
        console.error("Errore: ", e);
        alert("C'è stato un problema col salvataggio.");
    }
}
