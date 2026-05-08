import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

async function caricaPartite() {
    const selectPartita = document.getElementById('select-partita');
    selectPartita.innerHTML = "<option value=''>Scegli la partita...</option>";
    const q = query(collection(db, "calendario"), orderBy("data", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const d = doc.data();
        selectPartita.innerHTML += `<option value="${d.torneo}|${d.squadraA}|${d.squadraB}">[${d.torneo}] ${d.squadraA} vs ${d.squadraB} (${d.data})</option>`;
    });
}

window.login = async function() {
    const code = document.getElementById('referee-code').value;
    if (code === "") return alert("Inserisci un codice!");
    try {
        const q = query(collection(db, "arbitri"), where("codice", "==", code));
        const snap = await getDocs(q);
        if (snap.empty) { alert("Codice non valido!"); } 
        else {
            let sportAssegnato = "";
            snap.forEach((doc) => { sportAssegnato = doc.data().sport; });
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('dashboard-screen').classList.remove('hidden');
            document.getElementById('sport-type').value = sportAssegnato;
            
            if (sportAssegnato === 'pallavolo') {
                document.getElementById('campi-pallavolo').classList.remove('hidden');
                document.getElementById('campi-punti').classList.add('hidden');
            } else {
                document.getElementById('campi-pallavolo').classList.add('hidden');
                document.getElementById('campi-punti').classList.remove('hidden');
            }
            caricaPartite(); 
        }
    } catch (e) { alert("Errore di connessione."); }
}

window.toggleSpareggio = function() {
    document.getElementById('scelta-vincitore').classList.toggle('hidden', !document.getElementById('check-spareggio').checked);
}

window.salvaRisultato = async function() {
    const pSel = document.getElementById('select-partita').value;
    const sportScelto = document.getElementById('sport-type').value;
    const arbitro = document.getElementById('referee-code').value;
    const isSpareggio = document.getElementById('check-spareggio').checked;

    if (!pSel) return alert("Seleziona la sfida in alto!");
    const [torneo, nomeSqA, nomeSqB] = pSel.split('|');
    
    let pA = sportScelto === 'pallavolo' ? parseInt(document.getElementById('set-a').value) : parseInt(document.getElementById('punti-a').value);
    let pB = sportScelto === 'pallavolo' ? parseInt(document.getElementById('set-b').value) : parseInt(document.getElementById('punti-b').value);

    if (isNaN(pA) || isNaN(pB)) return alert("Inserisci i punteggi!");

    let ptA = 0, ptB = 0;
    const ptVittoria = (sportScelto === 'jolly') ? 4 : 3;
    const ptVittoriaSp = (sportScelto === 'jolly') ? 3 : 2;

    if (isSpareggio) {
        if (document.getElementById('vincitore-spareggio').value === "A") { ptA = ptVittoriaSp; ptB = 1; } 
        else { ptA = 1; ptB = ptVittoriaSp; }
    } else {
        if (pA > pB) { ptA = ptVittoria; ptB = 0; } 
        else if (pB > pA) { ptA = 0; ptB = ptVittoria; } 
        else return alert("Hai inserito un pareggio! Spunta la casella 'Partita decisa dopo pareggio'.");
    }

    try {
        await addDoc(collection(db, "risultati"), {
            torneo: torneo, squadraA: nomeSqA, squadraB: nomeSqB, sport: sportScelto, codiceArbitro: arbitro,
            punteggioFinaleA: pA, punteggioFinaleB: pB, puntiTorneoGuadagnatiA: ptA, puntiTorneoGuadagnatiB: ptB,
            vintaDopoPareggio: isSpareggio, dataInserimento: new Date()
        });
        alert(`Salvato! ${nomeSqA}: ${ptA} pt, ${nomeSqB}: ${ptB} pt.`);
        document.querySelectorAll('input[type="number"]').forEach(i => i.value = '');
        document.getElementById('check-spareggio').checked = false; toggleSpareggio();
    } catch (e) { alert("Problema col salvataggio."); }
}
