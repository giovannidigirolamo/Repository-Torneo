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

// Cambia campi sport
window.cambiaCampiSport = function() {
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

// SALVATAGGIO REALE SUL DATABASE
window.salvaRisultato = async function() {
    const sportScelto = document.getElementById('sport-type').value;
    const arbitro = document.getElementById('referee-code').value;
    
    // Raccogliamo i dati
    let datiPartita = {
        torneo: "Torneo Trisport Corridonia",
        squadraA: "Squadra A",
        squadraB: "Squadra B",
        sport: sportScelto,
        codiceArbitro: arbitro,
        dataInserimento: new Date()
    };

    if (sportScelto === 'calcio') {
        datiPartita.golA = document.querySelectorAll('#campi-calcio input')[0].value;
        datiPartita.golB = document.querySelectorAll('#campi-calcio input')[1].value;
    } else if (sportScelto === 'pallavolo') {
        datiPartita.setA = document.querySelectorAll('#campi-pallavolo input')[0].value;
        datiPartita.setB = document.querySelectorAll('#campi-pallavolo input')[1].value;
    }

    try {
        const docRef = await addDoc(collection(db, "risultati"), datiPartita);
        alert("Perfetto! Risultato salvato nel database con successo.");
        document.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
    } catch (e) {
        console.error("Errore: ", e);
        alert("C'è stato un problema col salvataggio.");
    }
}
