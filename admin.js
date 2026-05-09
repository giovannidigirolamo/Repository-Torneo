import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

window.checkAdminLogin = function() {
    if(document.getElementById('admin-pass').value === "trisport2026") {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        caricaDatiIniziali();
    } else alert("Password errata!");
}

window.showTab = function(tabId) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.tab-menu button').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    event.currentTarget.classList.add('active');
    
    if(tabId === 'tab-tornei') caricaTornei();
    if(tabId === 'tab-squadre') caricaSquadre();
    if(tabId === 'tab-classifica') calcolaClassifica();
    if(tabId === 'tab-risultati') caricaRisultati();
    if(tabId === 'tab-calendario') { caricaCalendario(); filtraSquadreCalendario(); }
    if(tabId === 'tab-arbitri') caricaArbitri();
}

function caricaDatiIniziali() {
    caricaTornei();
    caricaSquadre();
}

// --- GESTIONE TORNEI ---
window.aggiungiTorneo = async function() {
    const nome = document.getElementById('new-tournament-name').value;
    if(!nome) return alert("Inserisci un nome per il torneo!");
    try {
        await addDoc(collection(db, "tornei"), { nome });
        alert("Torneo '" + nome + "' creato con successo!"); // Feedback aggiunto
        document.getElementById('new-tournament-name').value = "";
        caricaTornei();
    } catch (e) {
        console.error("Errore: ", e);
        alert("Errore durante la creazione: " + e.message);
    }
}

async function caricaTornei() {
    const snap = await getDocs(collection(db, "tornei"));
    const lista = document.getElementById('lista-tornei');
    const selects = document.querySelectorAll('.select-tornei-dinamica');
    
    lista.innerHTML = "";
    let options = "<option value=''>Seleziona Torneo...</option>";
    
    snap.forEach(d => {
        const t = d.data();
        lista.innerHTML += `<div class="item-row"><span>${t.nome}</span> <button class="btn-delete" onclick="eliminaDato('tornei', '${d.id}', caricaTornei)">Elimina</button></div>`;
        options += `<option value="${t.nome}">${t.nome}</option>`;
    });
    
    selects.forEach(s => s.innerHTML = options);
}

// --- GESTIONE SQUADRE ---
window.aggiungiSquadra = async function() {
    const nome = document.getElementById('new-team-name').value;
    const torneo = document.getElementById('new-team-torneo').value;
    const girone = document.getElementById('new-team-group').value;
    if(!nome || !torneo) return alert("Inserisci nome e seleziona torneo");
    await addDoc(collection(db, "squadre"), { nome, torneo, girone });
    document.getElementById('new-team-name').value = "";
    caricaSquadre();
}

async function caricaSquadre() {
    const snap = await getDocs(query(collection(db, "squadre"), orderBy("torneo")));
    const container = document.getElementById('teams-list-pro');
    container.innerHTML = "";
    snap.forEach(d => {
        const s = d.data();
        container.innerHTML += `<div class="item-row">
            <span><strong>${s.nome}</strong> (${s.torneo} - ${s.girone})</span>
            <button class="btn-delete" onclick="eliminaDato('squadre', '${d.id}', caricaSquadre)">Elimina</button>
        </div>`;
    });
}

// --- GESTIONE CALENDARIO ---
window.creaAccoppiamento = async function() {
    const torneo = document.getElementById('match-torneo').value;
    const data = document.getElementById('match-date').value;
    const sqA = document.getElementById('select-team-a').value;
    const sqB = document.getElementById('select-team-b').value;
    if(!data || !sqA || sqA === sqB) return alert("Dati incompleti o squadre identiche");
    await addDoc(collection(db, "calendario"), { torneo, data, squadraA: sqA, squadraB: sqB });
    caricaCalendario();
}

async function caricaCalendario() {
    const snap = await getDocs(query(collection(db, "calendario"), orderBy("data", "desc")));
    const container = document.getElementById('lista-calendario-pro');
    container.innerHTML = "";
    snap.forEach(d => {
        const c = d.data();
        container.innerHTML += `<div class="item-row">
            <span>[${c.torneo}] ${c.data}: ${c.squadraA} vs ${c.squadraB}</span>
            <button class="btn-delete" onclick="eliminaDato('calendario', '${d.id}', caricaCalendario)">Annulla</button>
        </div>`;
    });
}

// --- GESTIONE RISULTATI ---
async function caricaRisultati() {
    const snap = await getDocs(query(collection(db, "risultati"), orderBy("dataInserimento", "desc")));
    let html = `<table><tr><th>Torneo</th><th>Match</th><th>Punti</th><th>Azioni</th></tr>`;
    snap.forEach(d => {
        const r = d.data();
        html += `<tr>
            <td>${r.torneo}</td>
            <td>${r.squadraA} - ${r.squadraB}</td>
            <td>${r.puntiTorneoGuadagnatiA} - ${r.puntiTorneoGuadagnatiB}</td>
            <td><button class="btn-delete" onclick="eliminaDato('risultati', '${d.id}', caricaRisultati)">Elimina</button></td>
        </tr>`;
    });
    document.getElementById('lista-risultati-pro').innerHTML = html + `</table>`;
}

// --- GESTIONE ARBITRI ---
window.aggiungiArbitro = async function() {
    const nome = document.getElementById('ref-name').value;
    const codice = document.getElementById('ref-code').value;
    const sport = document.getElementById('ref-sport').value;
    await addDoc(collection(db, "arbitri"), { nome, codice, sport });
    caricaArbitri();
}

async function caricaArbitri() {
    const snap = await getDocs(collection(db, "arbitri"));
    const container = document.getElementById('lista-arbitri-pro');
    container.innerHTML = "";
    snap.forEach(d => {
        const a = d.data();
        container.innerHTML += `<div class="item-row">
            <span>${a.nome} (${a.sport.toUpperCase()}) - Codice: ${a.codice}</span>
            <button class="btn-delete" onclick="eliminaDato('arbitri', '${d.id}', caricaArbitri)">Elimina</button>
        </div>`;
    });
}

// --- FUNZIONE UNIVERSALE PER ELIMINARE ---
window.eliminaDato = async function(collezione, id, callbackSuccesso) {
    if(confirm("Sei sicuro di voler eliminare questo elemento? L'azione è irreversibile.")) {
        try {
            await deleteDoc(doc(db, collezione, id));
            callbackSuccesso();
        } catch (e) { alert("Errore durante l'eliminazione"); }
    }
}

// --- FILTRO SQUADRE PER CALENDARIO ---
window.filtraSquadreCalendario = async function() {
    const torneoScelto = document.getElementById('match-torneo').value;
    const snap = await getDocs(collection(db, "squadre"));
    const selA = document.getElementById('select-team-a');
    const selB = document.getElementById('select-team-b');
    selA.innerHTML = ""; selB.innerHTML = "";
    snap.forEach(d => {
        if(d.data().torneo === torneoScelto) {
            const opt = `<option value="${d.data().nome}">${d.data().nome}</option>`;
            selA.innerHTML += opt; selB.innerHTML += opt;
        }
    });
}

// --- CLASSIFICA ---
window.calcolaClassifica = async function() {
    const torneoScelto = document.getElementById('filter-torneo').value;
    const container = document.getElementById('classifica-container');
    if(!torneoScelto) return container.innerHTML = "Seleziona un torneo per vedere la classifica.";
    
    container.innerHTML = "Calcolo...";
    const squadreSnap = await getDocs(collection(db, "squadre"));
    const risultatiSnap = await getDocs(collection(db, "risultati"));
    
    let classifica = {};
    squadreSnap.forEach(s => {
        if(s.data().torneo === torneoScelto) classifica[s.data().nome] = { nome: s.data().nome, girone: s.data().girone, punti: 0 };
    });

    risultatiSnap.forEach(r => {
        const res = r.data();
        if(res.torneo === torneoScelto) {
            if(classifica[res.squadraA]) classifica[res.squadraA].punti += (res.puntiTorneoGuadagnatiA || 0);
            if(classifica[res.squadraB]) classifica[res.squadraB].punti += (res.puntiTorneoGuadagnatiB || 0);
        }
    });

    let listaOrdinata = Object.values(classifica).sort((a, b) => b.punti - a.punti);
    let html = `<table><tr><th>Squadra</th><th>Girone</th><th>Punti</th></tr>`;
    listaOrdinata.forEach(s => html += `<tr><td>${s.nome}</td><td>${s.girone}</td><td><strong>${s.punti}</strong></td></tr>`);
    container.innerHTML = html + `</table>`;
}
