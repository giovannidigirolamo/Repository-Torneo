// Importiamo le funzioni base di Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// INCOLLA LE TUE CHIAVI FIREBASE QUI
const firebaseConfig = {
  apiKey: "AIzaSyAnYEtwrhmjT3aJY4dk_vST32cOX-kPe_M",
  authDomain: "torneo-trisport-corridonia.firebaseapp.com",
  projectId: "torneo-trisport-corridonia",
  storageBucket: "torneo-trisport-corridonia.firebasestorage.app",
  messagingSenderId: "330248876134",
  appId: "1:330248876134:web:f8814eda23c8da91063da7"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// CARICA IL CALENDARIO DA FIREBASE
async function caricaPartite() {
    const selectPartita = document.getElementById('select-partita');
    selectPartita.innerHTML = "<option value=''>Scegli la partita...</option>";
    
    try {
        // Peschiamo gli accoppiamenti dal database ordinati per data
        const q = query(collection(db, "calendario"), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const testoPartita = `${data.squadraA} vs ${data.squadraB} (${data.data})`;
            // Salviamo i nomi delle squadre dentro il "value" divisi da un trattino verticale
            const valorePartita = `${data.squadraA}|${data.squadraB}`; 
            
            selectPartita.innerHTML += `<option value="${valorePartita}">${testoPartita}</option>`;
        });
    } catch (e) {
        console.error("Errore nel caricamento del calendario:", e);
        selectPartita.innerHTML = "<option value=''>Errore caricamento</option>";
    }
}

// LOGIN
window.login = function() {
    const code = document.getElementById('referee-code').value;
    if (code !== "") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
        // Appena entra, carica automaticamente le partite dal database!
        caricaPartite(); 
    } else {
        alert("Inserisci un codice valido per accedere.");
    }
}

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

window.toggleSpareggio = function() {
    const isChecked = document.getElementById('check-spareggio').checked;
    const scelta = document.getElementById('scelta-vincitore');
    if (isChecked) {
        scelta.classList.remove('hidden');
    } else {
        scelta.classList.add('hidden');
    }
}

// SALVATAGGIO
window.salvaRisultato = async function() {
    const partitaSelezionata = document.getElementById('select-partita').value;
    const sportScelto = document.getElementById('sport-type').value;
    const arbitro = document.getElementById('referee-code').value;
    const isSpareggio = document.getElementById('check-spareggio').checked;

    if (!partitaSelezionata) {
        return alert("Devi prima selezionare la sfida dal menu in alto!");
    }

    // Dividiamo il testo per ottenere esattamente "NomeSquadraA" e "NomeSquadraB"
    const squadre = partitaSelezionata.split('|');
    const nomeSqA = squadre[0];
    const nomeSqB = squadre[1];
    
    let punteggioGrezzoA = sportScelto === 'pallavolo' ? parseInt(document.getElementById('set-a').value) : parseInt(document.getElementById('punti-a').value);
    let punteggioGrezzoB = sportScelto === 'pallavolo' ? parseInt(document.getElementById('set-b').value) : parseInt(document.getElementById('punti-b').value);

    if (isNaN(punteggioGrezzoA) || isNaN(punteggioGrezzoB)) return alert("Inserisci i punteggi prima di salvare!");

    let puntiTorneoA = 0;
    let puntiTorneoB = 0;
    
    const puntiVittoriaNetta = (sportScelto === 'jolly') ? 4 : 3;
    const puntiVittoriaSpareggio = (sportScelto === 'jolly') ? 3 : 2;
    const puntiSconfittaSpareggio = 1;

    if (isSpareggio) {
        const vincitoreSpareggio = document.getElementById('vincitore-spareggio').value;
        if (vincitoreSpareggio === "A") {
            puntiTorneoA = puntiVittoriaSpareggio;
            puntiTorneoB = puntiSconfittaSpareggio;
        } else {
            puntiTorneoA = puntiSconfittaSpareggio;
            puntiTorneoB = puntiVittoriaSpareggio;
        }
    } else {
        if (punteggioGrezzoA > punteggioGrezzoB) {
            puntiTorneoA = puntiVittoriaNetta;
            puntiTorneoB = 0;
        } else if (punteggioGrezzoB > punteggioGrezzoA) {
            puntiTorneoA = 0;
            puntiTorneoB = puntiVittoriaNetta;
        } else {
            return alert("Hai inserito un pareggio! Spunta la casella 'Partita decisa dopo pareggio'.");
        }
    }

    let datiPartita = {
        torneo: "Trisport Corridonia",
        squadraA: nomeSqA,  // Ora salva il NOME REALE!
        squadraB: nomeSqB,  // Ora salva il NOME REALE!
        sport: sportScelto,
        codiceArbitro: arbitro,
        punteggioFinaleA: punteggioGrezzoA,
        punteggioFinaleB: punteggioGrezzoB,
        puntiTorneoGuadagnatiA: puntiTorneoA,
        puntiTorneoGuadagnatiB: puntiTorneoB,
        vintaDopoPareggio: isSpareggio,
        dataInserimento: new Date()
    };

    try {
        await addDoc(collection(db, "risultati"), datiPartita);
        alert(`Salvato! ${nomeSqA} guadagna ${puntiTorneoA} pt, ${nomeSqB} guadagna ${puntiTorneoB} pt.`);
        
        document.querySelectorAll('input[type="number"]').forEach(i => i.value = '');
        document.getElementById('select-partita').value = '';
        document.getElementById('check-spareggio').checked = false;
        toggleSpareggio();
    } catch (e) {
        console.error("Errore: ", e);
        alert("Problema col salvataggio.");
    }
}
