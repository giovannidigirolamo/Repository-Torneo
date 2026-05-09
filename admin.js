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
    const target = document.getElementById(tabId);
    if(target) target.style.display = 'block';
    if(event) event.currentTarget.classList.add('active');
    
    // Caricamento dati specifico per ogni tab
    if(tabId === 'tab-tornei') caricaTornei();
    if(tabId === 'tab-gironi') caricaGironi();
    if(tabId === 'tab-squadre') { caricaTornei(); caricaSquadre(); }
    if(tabId === 'tab-calendario') { caricaTornei(); caricaCalendario(); }
    if(tabId === 'tab-risultati') caricaRisultati();
    if(tabId === 'tab-arbitri') caricaArbitri();
    if(tabId === 'tab-classifica') { caricaTornei(); calcolaClassifica(); }
}

function caricaDatiIniziali() {
    caricaTornei();
    caricaGironi();
}

// --- GESTIONE TORNEI ---
window.aggiungiTorneo = async function() {
    const nome = document.getElementById('new-tournament-name').value;
    if(!nome) return alert("Inserisci un nome!");
    await addDoc(collection(db, "tornei"), { nome });
    document.getElementById('new-tournament-name').value = "";
    alert("Torneo creato!");
    caricaTornei();
}

async function caricaTornei() {
    const snap = await getDocs(collection(db, "tornei"));
    const lista = document.getElementById('lista-tornei');
    const selects = document.querySelectorAll('.select-tornei-dinamica');
    let options = "<option value=''>Seleziona Torneo...</option>";
    if(lista) lista.innerHTML = "";
    
    snap.forEach(d => {
        const t = d.data();
        if(lista) lista.innerHTML += `<div class="item-row"><span>${t.nome}</span> <button class="btn-delete" onclick="eliminaDato('tornei', '${d.id}', caricaTornei)">Elimina</button></div>`;
        options += `<option value="${t.nome}">${t.nome}</option>`;
    });
    selects.forEach(s => s.innerHTML = options);
}

// --- GESTIONE GIRONI ---
window.aggiungiGirone = async function() {
    const torneo = document.getElementById('new-group-tournament').value;
    const nome = document.getElementById('new-group-name').value;
    if(!torneo || !nome) return alert("Seleziona un torneo e scrivi il nome del girone!");
    
    try {
        await addDoc(collection(db, "gironi"), { torneo, nome });
        alert("Girone '" + nome + "' creato con successo!");
        document.getElementById('new-group-name').value = "";
        caricaGironi();
    } catch (e) { console.error(e); alert("Errore!"); }
}

async function caricaGironi() {
    const snap = await getDocs(collection(db, "gironi"));
    const container = document.getElementById('lista-gironi');
    if(!container) return;
    container.innerHTML = "";
    snap.forEach(d => {
        const g = d.data();
        container.innerHTML += `<div class="item-row">
            <span>[${g.torneo}] <strong>${g.nome}</strong></span>
            <button class="btn-delete" onclick="eliminaDato('gironi', '${d.id}', caricaGironi)">Elimina</button>
        </div>`;
    });
}

// --- GESTIONE SQUADRE ---
window.caricaGironiPerSquadra = async function() {
    const torneoScelto = document.getElementById('new-team-torneo').value;
    const selGirone = document.getElementById('new-team-group');
    const snap = await getDocs(collection(db, "gironi"));
    let options = "<option value=''>Scegli Girone...</option>";
    snap.forEach(d => {
        if(d.data().torneo === torneoScelto) {
            options += `<option value="${d.data().nome}">${d.data().nome}</option>`;
        }
    });
    selGirone.innerHTML = options;
}

window.aggiungiSquadra = async function() {
    const nome = document.getElementById('new-team-name').value;
    const torneo = document.getElementById('new-team-torneo').value;
    const girone = document.getElementById('new-team-group').value;
    if(!nome || !torneo || !girone) return alert("Completa tutti i campi!");
    await addDoc(collection(db, "squadre"), { nome, torneo, girone });
    document.getElementById('new-team-name').value = "";
    alert("Squadra aggiunta!");
    caricaSquadre();
}

async function caricaSquadre() {
    const snap = await getDocs(query(collection(db, "squadre"), orderBy("torneo")));
    const container = document.getElementById('teams-list-pro');
    if(!container) return;
    container.innerHTML = "";
    snap.forEach(d => {
        const s = d.data();
        container.innerHTML += `<div class="item-row">
            <span><strong>${s.nome}</strong> (${s.torneo} - ${s.girone})</span>
            <button class="btn-delete" onclick="eliminaDato('squadre', '${d.id}', caricaSquadre)">Elimina</button>
        </div>`;
    });
}

// --- FUNZIONE ELIMINA ---
window.eliminaDato = async function(collezione, id, callback) {
    if(confirm("Eliminare definitivamente?")) {
        await deleteDoc(doc(db, collezione, id));
        callback();
    }
}

// Inizializza le altre funzioni (Calendario, Arbitri, Risultati) come nel codice precedente...
