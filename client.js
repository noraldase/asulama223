// client.js

// --- 1. KONFIGURASI FRONTEND ---
const CONFIG = {
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    chainId: 97, 
    chainHex: '0x61', 
    chainName: 'BSC Testnet',

    // PASTIKAN INI ADALAH DOMAIN API ANDA YANG BERFUNGSI DENGAN HTTPS
    backendUrl: 'https://api.poopx402.site',

    // PASTIKAN SEMUA ALAMAT INI BENAR (Gunakan alamat Testnet Anda)
    usdc: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    mytoken: '0xf1E42c42987d5E00fAd0e1805f9196B5E2DF3b2F', 
    relayer: '0x62150F2c3A29fDA8bCf22c0F22Eb17270FCBb78A', 
    serverWallet: '0xbdDD85bc42010110B8184d0fDA25659688bf935E'
};

// --- 2. ABI & VARIABEL GLOBAL ---
const ERC20_ABI = [ 'function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)', 'function approve(address,uint256) returns (bool)', 'function allowance(address,address) view returns (uint256)' ];

// Deklarasi global (HANYA SEKALI)
let provider, signer, userAddress;
let usdcContract, mytokenContract;

// --- 3. ELEMEN DOM ---
// Kode ini dijalankan saat file dimuat, jadi elemen HARUS ada di index.html
const walletDisplay = document.getElementById('walletDisplay');
const walletAddressSpan = document.getElementById('walletAddress');
const balancesCard = document.getElementById('balancesCard');
const usdcBalanceSpan = document.getElementById('usdcBalance');
const mytokenBalanceSpan = document.getElementById('mytokenBalance');
const spinButton = document.getElementById('spinButton');
const statusSection = document.getElementById('statusSection');
const stepsSection = document.getElementById('stepsSection');
const slotImgs = [ document.getElementById('slot1-img'), document.getElementById('slot2-img'), document.getElementById('slot3-img') ];
const allSymbolImages = [ 'images/Jesse.png', 'images/Base.png', 'images/BTC.png', 'images/ETH.png', 'images/Other.png' ];


// --- 4. FUNGSI HELPER (Utilitas) ---

function showStatus(message, type = 'info') {
    statusSection.innerHTML = `<div class="status status-${type}">${message}</div>`;
}
function resetSteps() {
    stepsSection.classList.add('hidden');
    // Perbarui loop untuk mencocokkan jumlah langkah (sekarang 6)
    for (let i = 1; i <= 6; i++) {
        const step = document.getElementById(`step${i}`);
        if(step) step.classList.remove('active', 'completed');
    }
}
function updateStep(stepNum, state) {
    if (stepNum === 1) { stepsSection.classList.remove('hidden'); }
    const step = document.getElementById(`step${stepNum}`);
    if (state === 'active') {
        step.classList.add('active');
        step.classList.remove('completed');
    } else if (state === 'completed') {
        step.classList.remove('active');
        step.classList.add('completed');
    }
}
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function loadBalances() {
    try {
        balancesCard.classList.remove('hidden');
        usdcBalanceSpan.textContent = 'Loading...';
        mytokenBalanceSpan.textContent = 'Loading...';

        const usdcBal = await usdcContract.balanceOf(userAddress);
        const mytokenBal = await mytokenContract.balanceOf(userAddress);
        
        usdcBalanceSpan.textContent = ethers.formatUnits(usdcBal, 6) + ' USDC'; // Asumsi 6 desimal
        mytokenBalanceSpan.textContent = ethers.formatUnits(mytokenBal, 18) + ' MYTOKEN'; // Asumsi 18 desimal

    } catch (error) {
        console.error("Gagal memuat saldo:", error);
        usdcBalanceSpan.textContent = 'Error';
        mytokenBalanceSpan.textContent = 'Error';
    }
}

async function animateSpin(duration = 2000) {
    updateStep(4, 'active'); // Step 4: Server is spinning
    slotImgs.forEach(img => img.classList.add('spinning'));
    let intervalId = setInterval(() => {
        for (const img of slotImgs) {
            const randomImg = allSymbolImages[Math.floor(Math.random() * allSymbolImages.length)];
            img.src = randomImg;
        }
    }, 80);
    await sleep(duration);
    clearInterval(intervalId);
    slotImgs.forEach(img => img.classList.remove('spinning'));
    updateStep(4, 'completed');
}

// --- 5. FUNGSI KONEKSI ---
// Fungsi ini hanya akan dijalankan JIKA kita belum terkoneksi
async function ensureWalletConnected() {
    // Jika signer sudah ada, kita sudah terkoneksi. Lewati.
    if (signer) return true;

    try {
        updateStep(1, 'active'); // Step 1: Connecting
        if (!window.ethereum) {
            alert('Please install MetaMask!');
            return false;
        }

        // --- Perbaikan ENS + KONEKSI ---
        const bscTestnet = new ethers.Network('bnbt', 97);
        bscTestnet.ensAddress = null; 
        // 'provider' (global) di-assign di sini
        provider = new ethers.BrowserProvider(window.ethereum, bscTestnet);
        
        await provider.send("eth_requestAccounts", []);
        
        // 'signer' (global) di-assign di sini
        signer = await provider.getSigner();
        userAddress = await signer.getAddress();
        
        // Coba ganti ke BSC Testnet
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONFIG.chainHex }], // '0x61'
        });

        // Inisialisasi kontrak
        usdcContract = new ethers.Contract(CONFIG.usdc, ERC20_ABI, signer); 
        mytokenContract = new ethers.Contract(CONFIG.mytoken, ERC20_ABI, provider);

        // Tampilkan info wallet & muat saldo
        walletAddressSpan.textContent = userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
        walletDisplay.classList.remove('hidden');
        await loadBalances();
        
        updateStep(1, 'completed');
        return true; // Koneksi sukses

    } catch (error) {
        console.error(error);
        showStatus('Gagal konek wallet: ' + error.message, 'error');
        updateStep(1, 'failed'); 
        return false; // Koneksi gagal
    }
}

// --- 6. FUNGSI UTAMA: SPIN SLOT ---
// Ini adalah SATU-SATUNYA fungsi yang dipanggil oleh HTML
async function spinSlot() {
    spinButton.disabled = true;
    resetSteps();
    
    try {
        // --- Langkah A: Pastikan Wallet Terkoneksi ---
        const isConnected = await ensureWalletConnected();
        if (!isConnected) {
            spinButton.disabled = false;
            return; 
        }

        // --- Langkah B: Approve USDC (Step 2) ---
        updateStep(2, 'active');
        showStatus('Checking USDC approval...', 'info');
        const amount = ethers.parseUnits('1', 6); // 1 USDC (6 desimal)
        const allowance = await usdcContract.allowance(userAddress, CONFIG.relayer);

        if (allowance < amount) {
            showStatus('Please approve 1 USDC for the relayer... (Gas required)');
            const approveTx = await usdcContract.approve(CONFIG.relayer, amount);
            await approveTx.wait();
            showStatus('Approval successful!', 'info');
        }
        updateStep(2, 'completed');

        // --- Langkah C: Sign Payment (Step 3) ---
        updateStep(3, 'active');
        showStatus('Sign the payment message (0 gas!)', 'info');

        const nonce = ethers.hexlify(ethers.randomBytes(32));
        const validAfter = Math.floor(Date.now() / 1000);
        const validBefore = validAfter + 600; // 10 menit
        const domain = { name: 'B402', version: '1', chainId: CONFIG.chainId, verifyingContract: CONFIG.relayer };
        const types = { TransferWithAuthorization: [ { name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }, { name: 'validAfter', type: 'uint256' }, { name: 'validBefore', type: 'uint256' }, { name: 'nonce', type: 'bytes32' } ] };
        const value = { from: userAddress, to: CONFIG.serverWallet, value: amount.toString(), validAfter, validBefore, nonce };

        const signature = await signer.signTypedData(domain, types, value);
        updateStep(3, 'completed');

        // --- Langkah D: Animasi dan Kirim ke Backend (Step 4 & 5) ---
        const animationPromise = animateSpin(2000); // Step 4

        updateStep(5, 'active'); // Step 5: Server paying
        const response = await fetch(`${CONFIG.backendUrl}/spin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authorization: value, signature, userAddress })
        });

        const result = await response.json();
        await animationPromise; 
        
        if (!result.success) {
            throw new Error(result.error || 'Backend failed to process spin.');
        }
        updateStep(5, 'completed');


        // --- Langkah E: Tampilkan Hasil (Step 6) ---
        updateStep(6, 'active');
        slotImgs[0].src = `images/${result.result[0]}.png`;
        slotImgs[1].src = `images/${result.result[1]}.png`;
        slotImgs[2].src = `images/${result.result[2]}.png`;

        let winMessage = `You got 1000 MYTOKEN!`;
        if (result.winnings > 0) {
            winMessage = `🎉 YOU WON ${result.winnings} USDC! 🎉<br>+ ${result.tokenReward} MYTOKEN!`;
        } else {
            winMessage = `You won ${result.tokenReward} MYTOKEN. Better luck next time!`;
        }

        showStatus(
            `${winMessage}
             <br><a class="link" href="https://testnet.bscscan.com/tx/${result.payoutTxHash}" target="_blank">View Payout Transaction</a>`,
            'success'
        );
        updateStep(6, 'completed');
        
        setTimeout(loadBalances, 3000);

    } catch (error) {
        console.error(error);
        showStatus('❌ Error: ' + error.message, 'error');
        resetSteps();
    } finally {
        spinButton.disabled = false;
    }
}
```

---

### Masalah #2: `GET ... /images/Base.png 404 (Not Found)`

**Apa Artinya:** Vercel tidak dapat menemukan file gambar Anda.

**Penyebab:** Struktur folder di repositori GitHub Anda (yang terhubung ke Vercel) salah. Vercel hanya akan men-deploy file yang Anda *push* ke GitHub.

**Solusi:**
Pastikan struktur folder proyek *frontend* Anda di GitHub terlihat **TEPAT** seperti ini:



```
/ (Folder Root Repositori Anda)
  |
  +-- index.html
  +-- client.js      (File yang baru saja Anda ganti)
  +-- style.css
  |
  +-- /images/       <-- HARUS ADA FOLDER BERNAMA 'images'
       |
       +-- Jesse.png
       +-- Base.png
       +-- BTC.png
       +-- ETH.png
       +-- Other.png
       +-- background.jpg
