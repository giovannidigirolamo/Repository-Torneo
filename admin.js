import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "INCOLLA_QUI_LA_TUA_API_KEY",
  authDomain: "INCOLLA_QUI_IL_TUO_AUTH_DOMAIN",
  projectId: "INCOLLA_QUI_IL_TUO_PROJECT_ID",
  storageBucket: "INCOLLA_QUI_IL_TUO_STORAGE_BUCKET",
  messagingSenderId: "INCOLLA_QUI_IL_TUO_MESSAGING_SENDER_ID",
  appId: "INCOLLA_QUI_IL_TUO_APP_ID"
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
        caricaSquadre(); // Aggiorna la lista
        alert("Squadra aggiunta!");
    } catch (e) { console.error(e); }
}

// --- FUNZIONE PER CARICARE LE SQUADRE NEI MENU A TENDINA ---
async function caricaSquadre() {
    const querySnapshot = await getDocs(query(collection(db, "squadre"), orderBy("nome")));
    const listHtml = document.getElementById('teams-list');
    const selectA = document.getElementById('select-team-a');
    const selectB = document.getElementById('select-team-b');

    listHtml.innerHTML = "";
    selectA.innerHTML = "";
    selectB.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const squadra = doc.data().nome;
        // Aggiunge alla lista visiva
        listHtml.innerHTML += `<li>• ${squadra}</li>`;
        // Aggiunge ai menu a tendina
        const option = `<option value="${squadra}">${squadra}</option>`;
        selectA.innerHTML += option;
        selectB.innerHTML += option;
    });
}

// --- FUNZIONE PER CREARE L'ACCOPPIAMENTO ---
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
    } catch (e) { console.error(e); }
}

// Avvia il caricamento iniziale
caricaSquadre();
