import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

console.log("admin.js caricato correttamente!"); // Verifica in console

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

// --- FUNZIONI GLOBALI (WINDOW) ---

window.checkAdminLogin = function() {
    if(document.getElementById('admin-pass').value === "trisport2026") {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        window.caricaTornei();
    } else alert("Errore!");
}

window.showTab = function(idTab) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(idTab);
    if(target) target.classList.remove('hidden');

    if(idTab === 'tab-tornei') window.caricaTornei();
    if(idTab === 'tab-gironi') window.caricaGironi();
    if(idTab === 'tab-squadre') { window.caricaTornei(); window.caricaSquadre(); }
}

window.aggiungiTorneo = async function() {
    const nome = document.getElementById('new-tournament-name').value;
    if(!nome) return alert("Inserisci nome");
    await addDoc(collection(db, "tornei"), { nome });
    document.getElementById('new-tournament-name').value = "";
    window.caricaTornei();
}

window.caricaTornei = async function() {
    const snap = await getDocs(collection(db, "tornei"));
    const lista = document.getElementById('lista-tornei');
    const selects = document.querySelectorAll('.select-tornei-dinamica');
    let html = ""; let options = "<option value=''>Scegli Torneo...</option>";
    
    snap.forEach(d => {
        const t = d.data();
        html += `<div class='item-row'>${t.nome} <button onclick="eliminaDato('tornei','${d.id}',window.caricaTornei)">X</button></div>`;
        options += `<option value="${t.nome}">${t.nome}</option>`;
    });
    if(lista) lista.innerHTML = html;
    selects.forEach(s => s.innerHTML = options);
}

window.aggiungiGirone = async function() {
    const torneo = document.getElementById('new-group-tournament').value;
    const nome = document.getElementById('new-group-name').value;
    if(!torneo || !nome) return alert("Dati mancanti");
    await addDoc(collection(db, "gironi"), { torneo, nome });
    alert("Girone creato!");
    window.caricaGironi();
}

window.caricaGironi = async function() {
    const snap = await getDocs(collection(db, "gironi"));
    const container = document.getElementById('lista-gironi');
    if(!container) return;
    container.innerHTML = "";
    snap.forEach(d => {
        const g = d.data();
        container.innerHTML += `<div class='item-row'>[${g.torneo}] ${g.nome}</div>`;
    });
}

window.caricaGironiPerSquadra = async function() {
    const torneo = document.getElementById('new-team-torneo').value;
    const sel = document.getElementById('new-team-group');
    const snap = await getDocs(collection(db, "gironi"));
    let opt = "";
    snap.forEach(d => { if(d.data().torneo === torneo) opt += `<option>${d.data().nome}</option>`; });
    sel.innerHTML = opt || "<option>Nessun girone</option>";
}

window.eliminaDato = async function(coll, id, callback) {
    if(confirm("Eliminare?")) {
        await deleteDoc(doc(db, coll, id));
        callback();
    }
}
