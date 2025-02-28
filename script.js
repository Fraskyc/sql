async function loadRecords() {
    const category = document.getElementById('filterCategory').value;
    const search = document.getElementById('searchText').value;

    let url = `/records?`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (search) url += `search=${encodeURIComponent(search)}`;

    const response = await fetch(url);
    const records = await response.json();
    const list = document.getElementById('recordsList');
    list.innerHTML = '';

    records.forEach(record => {
        const li = document.createElement('li');
        li.innerHTML = `<b>[${record.category}]</b> ${record.text}`;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Upravit';
        editBtn.onclick = () => editRecord(record);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Smazat';
        deleteBtn.onclick = () => deleteRecord(record.id);

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

async function addRecord() {
    const text = document.getElementById('recordText').value;
    const category = document.getElementById('recordCategory').value;

    if (!text) {
        alert("Zadejte text!");
        return;
    }

    const response = await fetch('/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category })
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert("Chyba: " + errorData.error);
        return;
    }

    document.getElementById('recordText').value = ''; // Vyčistí input
    loadRecords(); // Aktualizuje seznam
}


async function editRecord(record) {
    const newText = prompt("Upravte text:", record.text);
    if (!newText) return;

    const newCategory = prompt("Upravte kategorii (vtip/citát):", record.category);
    if (!newCategory || (newCategory !== "vtip" && newCategory !== "citát")) return alert("Neplatná kategorie!");

    await fetch(`/records/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText, category: newCategory })
    });

    loadRecords();
}

async function deleteRecord(id) {
    await fetch(`/records/${id}`, { method: 'DELETE' });
    loadRecords();
}

window.onload = loadRecords;
