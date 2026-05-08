import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyAnYEtwrhmjT3aJY4dk_vST32cOX-kPe_M", authDomain: "torneo-trisport-corridonia.firebaseapp.com", projectId: "torneo-trisport-corridonia", storageBucket: "torneo-trisport-corridonia.firebasestorage.app", messagingSenderId: "330248876134", appId: "1:330248876134:web:f8814eda23c8da91063da7" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.aggiornaVistaPubblica = async function() {
    const torneoScelto = document.getElementById('public-torneo').value;
    
    // 1. CARICA CLASSIFICA
    const squadreSnap = await getDocs(collection(db, "squadre"));
    const risultatiSnap = await getDocs(query(collection(db, "risultati"), orderBy("dataInserimento", "desc")));
    
    let classifica = {};
    squadreSnap.forEach(s => {
        if(s.data().torneo === torneoScelto) classifica[s.data().nome] = { nome: s.data().nome, girone: s.data().girone, punti: 0 };
    });

    let htmlRisultati = `<table><tr><th>Sport</th><th>Match</th><th>Risultato</th></tr>`;
    let countRisultati = 0;

    risultatiSnap.forEach(r => {
        const res = r.data();
        if(res.torneo === torneoScelto) {
            // Aggiorna punti classifica
            if(classifica[res.squadraA]) classifica[res.squadraA].punti += (res.puntiTorneoGuadagnatiA || 0);
            if(classifica[res.squadraB]) classifica[res.squadraB].punti += (res.puntiTorneoGuadagnatiB || 0);
            
            // Aggiungi agli ultimi risultati (mostra solo i più recenti)
            if(countRisultati < 15) {
                htmlRisultati += `<tr><td>${res.sport.toUpperCase()}</td><td>${res.squadraA} vs ${res.squadraB}</td><td><strong>${res.punteggioFinaleA} - ${res.punteggioFinaleB}</strong></td></tr>`;
                countRisultati++;
            }
        }
    });

    // Renderizza Classifica
    let listaOrdinata = Object.values(classifica).sort((a, b) => b.punti - a.punti);
    let htmlClassifica = `<table><tr><th>Squadra</th><th>Girone</th><th>Punti Totali</th></tr>`;
    listaOrdinata.forEach(s => htmlClassifica += `<tr><td>${s.nome}</td><td>${s.girone}</td><td style="font-size: 18px; color: #0056b3;"><strong>${s.punti}</strong></td></tr>`);
    document.getElementById('public-classifica').innerHTML = htmlClassifica + `</table>`;
    
    // Renderizza Risultati
    document.getElementById('public-risultati').innerHTML = countRisultati > 0 ? htmlRisultati + `</table>` : "<p>Nessun risultato ancora inserito per questo torneo.</p>";
}

// Carica subito al primo avvio
aggiornaVistaPubblica();
