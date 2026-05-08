import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = { apiKey: "AIzaSyAnYEtwrhmjT3aJY4dk_vST32cOX-kPe_M", authDomain: "torneo-trisport-corridonia.firebaseapp.com", projectId: "torneo-trisport-corridonia", storageBucket: "torneo-trisport-corridonia.firebasestorage.app", messagingSenderId: "330248876134", appId: "1:330248876134:web:f8814eda23c8da91063da7" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.checkAdminLogin = function() {
    if(document.getElementById('admin-pass').value === "Colorare23,") {
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
    if(tabId === 'tab-classifica') calcolaClassifica();
    if(tabId === 'tab-risultati') caricaRisultati();
    if(tabId === 'tab-calendario') filtraSquadreCalendario();
}

function caricaDatiIniziali() { caricaSquadre(); calcolaClassifica(); }

window.aggiungiSquadra = async function() {
    const nome = document.getElementById('new-team-name').value;
    const torneo = document.getElementById('new-team-torneo').value;
    const girone = document.getElementById('new-team-group').value;
    if(!nome) return;
    await addDoc(collection(db, "squadre"), { nome, torneo, girone });
    document.getElementById('new-team-name').value = ""; alert("Squadra Salvata"); caricaSquadre();
}

let tutteLeSquadre = [];
async function caricaSquadre() {
    const snap = await getDocs(query(collection(db, "squadre"), orderBy("nome")));
    tutteLeSquadre = [];
    document.getElementById('teams-list').innerHTML = "";
    snap.forEach(doc => {
        const d = doc.data();
        tutteLeSquadre.push(d);
        document.getElementById('teams-list').innerHTML += `<li><strong>${d.nome}</strong> <span class="badge">${d.torneo}</span> <span class="badge" style="background:#6c757d">${d.girone}</span></li>`;
    });
}

window.filtraSquadreCalendario = function() {
    const torneoScelto = document.getElementById('match-torneo').value;
    const selA = document.getElementById('select-team-a');
    const selB = document.getElementById('select-team-b');
    selA.innerHTML = ""; selB.innerHTML = "";
    tutteLeSquadre.forEach(s => {
        if(s.torneo === torneoScelto) {
            const opt = `<option value="${s.nome}">${s.nome}</option>`;
            selA.innerHTML += opt; selB.innerHTML += opt;
        }
    });
}

window.creaAccoppiamento = async function() {
    const torneo = document.getElementById('match-torneo').value;
    const data = document.getElementById('match-date').value;
    const sqA = document.getElementById('select-team-a').value;
    const sqB = document.getElementById('select-team-b').value;
    if(!data || sqA === sqB) return alert("Dati errati");
    await addDoc(collection(db, "calendario"), { torneo, data, squadraA: sqA, squadraB: sqB });
    alert("Sfida creata per il torneo " + torneo);
}

window.calcolaClassifica = async function() {
    const torneoScelto = document.getElementById('filter-torneo').value;
    const container = document.getElementById('classifica-container');
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

window.caricaRisultati = async function() {
    const snap = await getDocs(query(collection(db, "risultati"), orderBy("dataInserimento", "desc")));
    let html = `<table><tr><th>Torneo</th><th>Data</th><th>Sport</th><th>Match</th><th>Punteggio</th><th>Pt. Ass.</th></tr>`;
    snap.forEach(doc => {
        const r = doc.data();
        html += `<tr><td>${r.torneo}</td><td>${r.dataInserimento.toDate().toLocaleDateString()}</td><td>${r.sport.toUpperCase()}</td><td>${r.squadraA} - ${r.squadraB}</td><td>${r.punteggioFinaleA} - ${r.punteggioFinaleB}</td><td>${r.puntiTorneoGuadagnatiA} a ${r.puntiTorneoGuadagnatiB}</td></tr>`;
    });
    document.getElementById('lista-risultati').innerHTML = html + `</table>`;
}

window.aggiungiArbitro = async function() {
    const nome = document.getElementById('ref-name').value;
    const codice = document.getElementById('ref-code').value;
    const sport = document.getElementById('ref-sport').value;
    if(!nome || !codice) return;
    await addDoc(collection(db, "arbitri"), { nome, codice, sport });
    alert("Arbitro creato!");
}
