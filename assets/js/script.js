const API_URL = "https://jsonplaceholder.typicode.com/users";
let users = [];
let filteredUsers = [];
let currentPage = 1;
const itemsPerPage = 5;
let confirmCallback = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    
    document.getElementById('msgConfirmBtn').addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
        }
        closeMessageModal();
    });
});

function showMessage(title, message, type = 'success') {
    const modal = document.getElementById('messageModal');
    const iconEl = document.getElementById('msgIcon');
    const confirmBtn = document.getElementById('msgConfirmBtn');
    const cancelBtn = document.getElementById('msgCancelBtn');

    document.getElementById('msgTitle').innerText = title;
    document.getElementById('msgContent').innerText = message;
    
    if (type === 'success') {
        iconEl.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #2e7d32;"></i>';
    } else if (type === 'error') {
        iconEl.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #d32f2f;"></i>';
    }

    cancelBtn.style.display = 'none';
    confirmBtn.innerText = 'Đã hiểu';
    confirmBtn.className = 'btn btn-primary';
    
    confirmCallback = null;

    document.getElementById('overlay').style.display = 'block';
    modal.style.display = 'block';
}

function showConfirm(message, onConfirm) {
    const modal = document.getElementById('messageModal');
    const iconEl = document.getElementById('msgIcon');
    const confirmBtn = document.getElementById('msgConfirmBtn');
    const cancelBtn = document.getElementById('msgCancelBtn');

    document.getElementById('msgTitle').innerText = "Xác nhận hành động";
    document.getElementById('msgContent').innerText = message;
    
    iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #ffa000;"></i>';

    cancelBtn.style.display = 'inline-block';
    confirmBtn.innerText = 'Đồng ý';
    confirmBtn.className = 'btn btn-danger';

    confirmCallback = onConfirm;

    document.getElementById('overlay').style.display = 'block';
    modal.style.display = 'block';
}

function closeMessageModal() {
    document.getElementById('messageModal').style.display = 'none';
    if (document.getElementById('userModal').style.display === 'none') {
        document.getElementById('overlay').style.display = 'none';
    }
}

async function fetchUsers() {
    const loading = document.getElementById('loading');
    const tbody = document.getElementById('userTableBody');
    
    try {
        loading.style.display = 'block';
        tbody.innerHTML = '';
        
        const response = await axios.get(API_URL);
        users = response.data;
        filteredUsers = [...users];
        renderTable();
    } catch (error) {
        console.error(error);
        showMessage("Lỗi kết nối", "Không thể tải danh sách người dùng!", "error");
    } finally {
        loading.style.display = 'none';
    }
}

function renderTable() {
    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";

    if (filteredUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">Không tìm thấy dữ liệu.</td></tr>`;
        document.getElementById("pageIndicator").innerText = `Trang 0/0`;
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const usersToDisplay = filteredUsers.slice(startIndex, endIndex);

    usersToDisplay.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${user.id}</td>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td class="text-center">
                <button class="btn btn-warning" onclick="prepareEditUser(${user.id})">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="btn btn-danger" onclick="confirmDeleteUser(${user.id})">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    document.getElementById("pageIndicator").innerText = `Trang ${currentPage}/${totalPages}`;
}

function handleSearch() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
    );
    currentPage = 1;
    renderTable();
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const newPage = currentPage + direction;
    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        renderTable();
    }
}

function openUserModal() {
    document.getElementById("modalTitle").innerText = "Thêm mới User";
    document.getElementById("userId").value = "";
    document.getElementById("userName").value = "";
    document.getElementById("userEmail").value = "";
    document.getElementById("userPhone").value = "";
    
    document.getElementById("userModal").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function closeUserModal() {
    document.getElementById("userModal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function prepareEditUser(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        document.getElementById("modalTitle").innerText = "Cập nhật User";
        document.getElementById("userId").value = user.id;
        document.getElementById("userName").value = user.name;
        document.getElementById("userEmail").value = user.email;
        document.getElementById("userPhone").value = user.phone;
        
        document.getElementById("userModal").style.display = "block";
        document.getElementById("overlay").style.display = "block";
    }
}

async function saveUser() {
    const id = document.getElementById("userId").value;
    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const phone = document.getElementById("userPhone").value.trim();

    if (!name || !email) {
        showMessage("Thiếu thông tin", "Vui lòng nhập đầy đủ Họ tên và Email.", "error");
        return;
    }

    const userData = { name, email, phone };
    const saveBtn = document.querySelector('#userModal .modal-footer .btn-primary');
    const originalBtnText = saveBtn.innerHTML;
    
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
    saveBtn.disabled = true;

    try {
        if (id) {
            await axios.put(`${API_URL}/${id}`, userData);
            const index = users.findIndex(u => u.id == id);
            if (index !== -1) users[index] = { ...users[index], ...userData };
            
            showMessage("Thành công", "Cập nhật thông tin người dùng thành công!", "success");
        } else {
            await axios.post(API_URL, userData);
            const newUser = { id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1, ...userData };
            users.unshift(newUser);
            
            showMessage("Thành công", "Thêm người dùng mới thành công!", "success");
        }

        closeUserModal();
        handleSearch();

    } catch (error) {
        console.error(error);
        showMessage("Lỗi", "Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.", "error");
    } finally {
        saveBtn.innerHTML = originalBtnText;
        saveBtn.disabled = false;
    }
}

function confirmDeleteUser(id) {
    showConfirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.", () => {
        executeDelete(id);
    });
}

async function executeDelete(id) {
    try {
        await axios.delete(`${API_URL}/${id}`);
        
        users = users.filter(u => u.id !== id);
        handleSearch();
        
        showMessage("Đã xóa", "Người dùng đã được xóa khỏi hệ thống.", "success");
    } catch (error) {
        console.error(error);
        showMessage("Lỗi", "Xóa thất bại! Vui lòng kiểm tra lại.", "error");
    }
}