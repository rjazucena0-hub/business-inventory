const BASE_API = '/api';

async function fetchDashboard() {
    const res = await fetch(`${BASE_API}/food/all`);
    const data = await res.json();
    const foodGrid = document.getElementById('foodGrid');
    const bevGrid = document.getElementById('beverageGrid');
    
    foodGrid.innerHTML = ''; bevGrid.innerHTML = '';

    data.items.forEach(item => {
        const card = document.createElement('div');
        card.className = `card ${item.stock < 5 ? 'low-stock' : ''}`;
        card.innerHTML = `
            <h3>${item.name}</h3>
            <div class="stock-num">${item.stock}</div>
            <div class="controls">
                <button onclick="updateStock(${item.id}, ${item.stock - 1})">-</button>
                <button onclick="updateStock(${item.id}, ${item.stock + 1})">+</button>
            </div>
            <button class="btn-delete" onclick="deleteItem(${item.id})">Delete</button>
        `;
        (item.category === 'Beverage') ? bevGrid.appendChild(card) : foodGrid.appendChild(card);
    });
}

async function addItem() {
    const payload = { 
        name: document.getElementById('itemName').value,
        stock: parseInt(document.getElementById('itemStock').value),
        category: document.getElementById('itemCategory').value 
    };
    if(!payload.name || isNaN(payload.stock)) return;

    await fetch(`${BASE_API}/food`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    fetchDashboard();
}

async function updateStock(id, newStock) {
    if(newStock < 0) return;
    await fetch(`${BASE_API}/food`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id, stock: newStock })
    });
    fetchDashboard();
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    await fetch(`${BASE_API}/food/${id}`, { method: 'DELETE' });
    fetchDashboard();
}

fetchDashboard();
