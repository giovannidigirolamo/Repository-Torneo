import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// INCOLLA QUI I TUOI DATI REALI DI FIREBASE
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

// --- FUNZIONE PER AGGIUNGERE UNA SQUADRA ---
window.aggiungiSquadra = async function() {
    const nome = document.getElementById('new-team-name').value;
    if (!nome) return alert("Inserisci un nome!");

    try {
        await addDoc(collection(db, "squadre"), { nome: nome });
        document.getElementById('new-team-name').value = "";
        caricaSquadre(); // Aggiorna subito la lista a schermo
        alert("Squadra aggiunta correttamente!");
    } catch (e) { 
        console.error("ERRORE:", e);
        alert("Errore durante il salvataggio. Controlla la console.");
    }
}

// --- FUNZIONE PER CARICARE LE SQUADRE ---
async function caricaSquadre() {
    try {
        const querySnapshot = await getDocs(query(collection(db, "squadre"), orderBy("nome")));
        const listHtml = document.getElementById('teams-list');
        const selectA = document.getElementById('select-team-a');
        const selectB = document.getElementById('select-team-b');

        listHtml.innerHTML = "";
        selectA.innerHTML = "";
        selectB.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const squadra = doc.data().nome;
            listHtml.innerHTML += `<li>• ${squadra}</li>`;
            const option = `<option value="${squadra}">${squadra}</option>`;
            selectA.innerHTML += option;
            selectB.innerHTML += option;
        });
    } catch (e) {
        console.error("Errore nel caricamento squadre:", e);
    }
}

// --- FUNZIONE PER CREARE L'ACCOPPIAMENTO (IL CALENDARIO) ---
window.creaAccoppiamento = async function() {
    const data = document.getElementById('match-date').value;
    const sqA = document.getElementById('select-team-a').value;
    const sqB = document.getElementById('select-team-b').value;

    if (!data || sqA === sqB) return alert("Controlla la data e assicurati che le squadre siano diverse!");

    try {
        await addDoc(collection(db, "calendario"), {
            data: data,
            squadraA: sqA,
            squadraB: sqB,
            creatoIl: new Date()
        });
        alert(`Sfida ${sqA} vs ${sqB} creata per il giorno ${data}`);
    } catch (e) { 
        console.error("Errore creazione sfida:", e); 
    }
}

// Carica le squadre appena apri la pagina
caricaSquadre();
