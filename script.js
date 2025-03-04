async function loadRecords() {
    const response = await fetch('/records');
    let records = await response.json();

    // Filtrování podle kategorie
    const selectedCategory = document.getElementById('filterCategory').value;
    if (selectedCategory !== 'all') {
        records = records.filter(record => record.category === selectedCategory);
    }

    // Hledání v textu
    const searchText = document.getElementById('searchText').value.toLowerCase();
    if (searchText) {
        records = records.filter(record => record.text.toLowerCase().includes(searchText));
    }

    const list = document.getElementById('recordsList');
    list.innerHTML = '';
    records.forEach(record => {
        const li = document.createElement('li');

        let displayText = record.category === 'úkol' 
            ? `[${record.sub_category || 'Neurčeno'}] ${record.text} (${record.category})`
            : `${record.text} (${record.category})`;

        li.textContent = displayText;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Smazat';
        deleteBtn.onclick = () => deleteRecord(record.id);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

async function addRecord() {
    const text = document.getElementById('recordText').value;
    const category = document.getElementById('recordCategory').value;
    const sub_category = category === 'úkol' ? document.getElementById('recordSubCategory').value : '';

    if (!text) return;

    await fetch('/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category, sub_category })
    });

    document.getElementById('recordText').value = '';
    loadRecords();
}


async function deleteRecord(id) {
    await fetch(`/records/${id}`, { method: 'DELETE' });
    loadRecords();
}

function toggleSubCategory() {
    const category = document.getElementById('recordCategory').value;
    const subCategorySelect = document.getElementById('recordSubCategory');
    subCategorySelect.style.display = category === 'úkol' ? 'inline-block' : 'none';
}

window.onload = loadRecords;

