const BASE_API = 'https://business-inventory.onrender.com/api';
const LOW_STOCK_THRESHOLD = 5;

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderLowStockAlerts(items) {
    const section = document.getElementById('lowStockSection');
    const banner = document.getElementById('lowStockBanner');
    const countEl = document.getElementById('lowStockCount');
    const lowStockItems = items.filter(item => item.stock < LOW_STOCK_THRESHOLD);

    if (lowStockItems.length === 0) {
        section.classList.remove('has-alerts');
        countEl.textContent = '0 items';
        countEl.classList.add('is-clear');
        banner.innerHTML = `
            <p class="low-stock-empty">
                <i class="ph ph-check-circle"></i>
                All items are well stocked — no alerts right now.
            </p>`;
        return;
    }

    section.classList.add('has-alerts');
    countEl.classList.remove('is-clear');
    countEl.textContent = `${lowStockItems.length} item${lowStockItems.length === 1 ? '' : 's'}`;

    banner.innerHTML = lowStockItems.map(item => `
        <span class="low-stock-chip">
            <i class="ph ph-warning"></i>
            <span>${escapeHtml(item.name)}</span>
            <span class="low-stock-chip__stock">${item.stock} left</span>
            <span class="low-stock-chip__category">${escapeHtml(item.category)}</span>
        </span>
    `).join('');
}

function renderCard(item) {
    const isLowStock = item.stock < LOW_STOCK_THRESHOLD;
    const isBeverage = item.category === 'Beverage';
    const card = document.createElement('div');
    card.className = `card${isLowStock ? ' low-stock' : ''}${isBeverage ? ' card--beverage' : ''}`;

    const categoryIcon = isBeverage ? 'ph-wine' : 'ph-cooking-pot';
    const lowStockBadge = isLowStock
        ? `<span class="low-stock-badge"><i class="ph ph-warning"></i> Low Stock</span>`
        : '';

    card.innerHTML = `
        <div class="card__top">
            <div class="card__category-icon">
                <i class="ph ${categoryIcon}"></i>
            </div>
            <div class="card__badges">
                ${lowStockBadge}
            </div>
        </div>
        <h3>${escapeHtml(item.name)}</h3>
        <div class="card__stock-row">
            <span class="stock-label">In Stock</span>
            <div class="stock-num">${item.stock}</div>
        </div>
        <div class="card__actions">
            <div class="controls">
                <button type="button" onclick="updateStock(${item.id}, ${item.stock - 1})" aria-label="Decrease stock">
                    <i class="ph ph-minus"></i>
                </button>
                <button type="button" onclick="updateStock(${item.id}, ${item.stock + 1})" aria-label="Increase stock">
                    <i class="ph ph-plus"></i>
                </button>
            </div>
            <button type="button" class="btn-delete" onclick="deleteItem(${item.id})">
                <i class="ph ph-trash"></i>
                Delete
            </button>
        </div>
    `;
    return card;
}

function renderGrid(gridEl, items, emptyIcon, emptyMessage) {
    gridEl.innerHTML = '';
    if (items.length === 0) {
        gridEl.innerHTML = `
            <p class="grid-empty">
                <i class="ph ${emptyIcon}"></i>
                ${emptyMessage}
            </p>`;
        return;
    }
    items.forEach(item => gridEl.appendChild(renderCard(item)));
}

async function fetchDashboard() {
    try {
        const res = await fetch(`${BASE_API}/food/all`);
        const data = await res.json();
        const foodGrid = document.getElementById('foodGrid');
        const bevGrid = document.getElementById('beverageGrid');

        const itemsArray = data.items || data.rows || (Array.isArray(data) ? data : []);

        renderLowStockAlerts(itemsArray);

        const foodItems = itemsArray.filter(item => item.category !== 'Beverage');
        const bevItems = itemsArray.filter(item => item.category === 'Beverage');

        renderGrid(foodGrid, foodItems, 'ph-cooking-pot', 'No food items yet. Add one above.');
        renderGrid(bevGrid, bevItems, 'ph-wine', 'No beverage items yet. Add one above.');
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
    }
}

async function addItem() {
    const payload = {
        name: document.getElementById('itemName').value,
        stock: parseInt(document.getElementById('itemStock').value, 10),
        category: document.getElementById('itemCategory').value
    };
    if (!payload.name || isNaN(payload.stock)) return;

    await fetch(`${BASE_API}/food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    document.getElementById('itemName').value = '';
    document.getElementById('itemStock').value = '';
    fetchDashboard();
}

async function updateStock(id, newStock) {
    if (newStock < 0) return;
    await fetch(`${BASE_API}/food`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
