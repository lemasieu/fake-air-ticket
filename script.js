// ===== LẤY CÁC PHẦN TỬ DOM =====
const form = document.getElementById('ticketForm');
const updateBtn = document.getElementById('updateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const ticketPreview = document.getElementById('ticketPreview');
const brandColorInput = document.getElementById('brandColor');
const airlineInput = document.getElementById('airline');
const airlineError = document.getElementById('airlineError');

// ===== DANH SÁCH TỪ KHÓA HÃNG HÀNG KHÔNG CẦN CHẶN =====
// Dùng từ khóa ngắn, distinctive để bắt được mọi biến thể nhập liệu
const BLACKLISTED_KEYWORDS = [
    // Đang hoạt động
    "vietnamair",      // Vietnam Airlines / Vietnam Air
    "vietjet",         // Vietjet Air / Vietjet
    "bambooair",       // Bamboo Airways
    "pacificair",      // Pacific Airlines
    "vietravel",       // Vietravel Airlines
    "vasco",           // VASCO
    "vietstar",        // Vietstar Airlines
    "haiau",           // Hai Au Aviation
    // Đã ngừng hoạt động
    "jetstar",         // Jetstar Pacific
    "indochinaair",    // Indochina Airlines
    "airmekong",       // Air Mekong
    "traitien"         // Trai Tien Air Cargo
];

// ===== HÀM CHUẨN HÓA CHUỖI =====
// Bỏ toàn bộ ký tự không phải chữ/số, chuyển lowercase
// "Viet-nam Airlines" → "vietnamairlines"
// "v i e t j e t"     → "vietjet"
function normalizeString(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ===== KIỂM TRA HÃNG CÓ BỊ CHẶN KHÔNG =====
function isAirlineBlacklisted(name) {
    const normalized = normalizeString(name);
    if (!normalized) return false;
    return BLACKLISTED_KEYWORDS.some(keyword => normalized.includes(keyword));
}

// ===== HÀM CHUYỂN HEX SANG RGBA =====
function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ===== ÁP DỤNG MÀU THƯƠNG HIỆU =====
function applyBrandColor(hexColor) {
    const root = document.documentElement;
    root.style.setProperty('--brand-color', hexColor);
    root.style.setProperty('--brand-color-light', hexToRgba(hexColor, 0.12));
}

// ===== CẬP NHẬT VÉ TỪ FORM =====
function updateTicket() {
    const airline = airlineInput.value.trim() || 'Sorry Airlines';
    const passengerName = document.getElementById('passengerName').value || 'NGUYEN VAN A';
    const flightNumber = document.getElementById('flightNumber').value || 'SA123';
    const fromCode = document.getElementById('fromCode').value.toUpperCase() || 'SGN';
    const fromCity = document.getElementById('fromCity').value || 'Ho Chi Minh';
    const toCode = document.getElementById('toCode').value.toUpperCase() || 'HAN';
    const toCity = document.getElementById('toCity').value || 'Ha Noi';
    const departureTime = document.getElementById('departureTime').value || '08:30';
    const arrivalTime = document.getElementById('arrivalTime').value || '10:45';
    const dateValue = document.getElementById('date').value || '2026-06-15';
    const seat = document.getElementById('seat').value || '12A';
    const gate = document.getElementById('gate').value || 'A12';
    const ticketClass = document.getElementById('class').value || 'Economy';
    const pnr = document.getElementById('pnr').value.toUpperCase() || 'ABC123';

    const dateObj = new Date(dateValue + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // ===== KIỂM TRA TÊN HÃNG =====
    const isBlocked = isAirlineBlacklisted(airline);

    if (isBlocked) {
        // Hiển thị lỗi
        airlineError.textContent = '⚠️ Tên hãng hàng không này có thật hoặc quá giống hãng có thật. Vui lòng dùng tên hư cấu (ví dụ: Sorry Airlines, Delay Air).';
        airlineError.style.display = 'block';
        airlineInput.classList.add('input-error');

        // Vô hiệu hóa 2 nút
        updateBtn.disabled = true;
        downloadBtn.disabled = true;
        downloadBtn.textContent = '🚫 Không thể tải';
    } else {
        // Xóa lỗi
        airlineError.style.display = 'none';
        airlineInput.classList.remove('input-error');

        // Kích hoạt lại 2 nút
        updateBtn.disabled = false;
        downloadBtn.disabled = false;
        downloadBtn.textContent = '⬇️ Tải ảnh về máy';

        // Chỉ cập nhật tên hãng trên vé khi hợp lệ
        document.getElementById('ticketAirline').textContent = airline;
    }
    // ==============================

    // Các field khác luôn được cập nhật
    document.getElementById('ticketPassenger').textContent = passengerName;
    document.getElementById('ticketFlight').textContent = flightNumber;
    document.getElementById('ticketFromCode').textContent = fromCode;
    document.getElementById('ticketFromCity').textContent = fromCity;
    document.getElementById('ticketToCode').textContent = toCode;
    document.getElementById('ticketToCity').textContent = toCity;
    document.getElementById('ticketDepTime').textContent = departureTime;
    document.getElementById('ticketArrTime').textContent = arrivalTime;
    document.getElementById('ticketDate').textContent = formattedDate;
    document.getElementById('ticketSeat').textContent = seat;
    document.getElementById('ticketGate').textContent = gate;
    document.getElementById('ticketClass').textContent = ticketClass;
    document.getElementById('ticketPNR').textContent = pnr;
}

// ===== TẢI ẢNH VỀ MÁY =====
async function downloadTicket() {
    // === LỚP BẢO VỆ THỨ 2: kiểm tra lại trước khi tải ===
    const airline = airlineInput.value.trim() || 'Sorry Airlines';
    if (isAirlineBlacklisted(airline)) {
        alert('Không thể tải ảnh: tên hãng hàng không không hợp lệ.');
        return;
    }
    // ==================================================

    try {
        downloadBtn.textContent = '⏳ Đang tạo ảnh...';
        downloadBtn.disabled = true;

        const canvas = await html2canvas(ticketPreview, {
            backgroundColor: '#0d1117',
            scale: 2,
            useCORS: true,
            logging: false
        });

        const link = document.createElement('a');
        link.download = `fake-air-ticket-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('Lỗi khi tạo ảnh:', error);
        alert('Có lỗi xảy ra khi tạo ảnh. Vui lòng thử lại!');
    } finally {
        // Chỉ khôi phục nếu vẫn hợp lệ
        if (!isAirlineBlacklisted(airlineInput.value.trim() || 'Sorry Airlines')) {
            downloadBtn.textContent = '⬇️ Tải ảnh về máy';
            downloadBtn.disabled = false;
        }
    }
}

// ===== GẮN SỰ KIỆN =====
updateBtn.addEventListener('click', updateTicket);
downloadBtn.addEventListener('click', downloadTicket);
form.addEventListener('input', updateTicket);

brandColorInput.addEventListener('input', (e) => {
    applyBrandColor(e.target.value);
});

// ===== KHỞI TẠO =====
updateTicket();
applyBrandColor(brandColorInput.value);