/**
 * Encrypted HTML Backup Generator
 * -------------------------------
 * Generates a self-contained, password-protected HTML file containing encrypted vault data.
 * The file can be opened in any browser, decrypted client-side using Web Crypto, and search/copied.
 */

export async function encryptExportData(dataStr: string, password: string) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes optimal for AES-GCM

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // 100k iterations is standard & compatible for browsers
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(dataStr)
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

export function generateEncryptedHtmlPage(ciphertext: string, salt: string, iv: string, username: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kylrix Secure Encrypted Vault Backup</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts Outfit & Space Grotesk -->
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      background-color: #050505;
      color: #E2E8F0;
    }
    .font-clash {
      font-family: 'Space Grotesk', sans-serif;
    }
    .glass {
      background: rgba(18, 18, 18, 0.8);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glow-emerald {
      box-shadow: 0 0 40px rgba(16, 185, 129, 0.1);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">

  <!-- Background decorations -->
  <div class="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-[-1]">
    <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[150px]"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[150px]"></div>
  </div>

  <main class="flex-1 flex items-center justify-center p-4">
    <!-- Decryption Screen -->
    <div id="unlock-screen" class="w-full max-w-md p-8 rounded-[32px] glass glow-emerald animate-in fade-in zoom-in-95 duration-300">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-black font-clash text-white tracking-tight">Kylrix Secure Vault</h1>
        <p class="text-sm text-slate-400 mt-2">Encrypted backup for <strong class="text-emerald-400">${username}</strong></p>
      </div>

      <form id="unlock-form" class="space-y-6">
        <div>
          <label for="password" class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Master Password</label>
          <input type="password" id="password" required placeholder="••••••••" 
            class="w-full px-4 py-3.5 rounded-2xl bg-black/50 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition">
        </div>

        <button type="submit" id="unlock-btn" 
          class="w-full py-4 px-6 font-extrabold rounded-2xl bg-emerald-500 text-black hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.2)]">
          <span>Decrypt Backup</span>
        </button>

        <div id="error-message" class="hidden text-center text-red-400 text-xs font-semibold p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
          Decryption failed. Please verify your password.
        </div>
      </form>
    </div>

    <!-- Dashboard Screen (Hidden initially) -->
    <div id="dashboard-screen" class="hidden w-full max-w-5xl p-6 md:p-8 rounded-[32px] glass glow-emerald flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">SECURE LOCAL BACKUP</span>
          </div>
          <h1 class="text-3xl font-black font-clash text-white tracking-tight mt-2">Decrypted Credentials</h1>
          <p class="text-sm text-slate-400 mt-1" id="export-info"></p>
        </div>
        <button id="download-json" class="self-start md:self-auto py-2.5 px-5 text-sm font-bold rounded-xl border border-white/10 text-white hover:bg-white/5 transition flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export Raw JSON
        </button>
      </div>

      <!-- Search & Stats -->
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:max-w-md">
          <input type="text" id="search-input" placeholder="Search by name, username, or URL..." 
            class="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/30 border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/30 transition">
          <svg class="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <div class="text-xs text-slate-500 font-bold" id="item-counter"></div>
      </div>

      <!-- List Container -->
      <div class="overflow-hidden rounded-2xl border border-white/5 bg-black/20">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/5 bg-black/40 text-slate-500 text-xs font-bold tracking-widest uppercase">
                <th class="p-4">Name</th>
                <th class="p-4">Username</th>
                <th class="p-4">Password</th>
                <th class="p-4">URL</th>
                <th class="p-4">Notes</th>
              </tr>
            </thead>
            <tbody id="credentials-list" class="divide-y divide-white/5 text-sm">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <footer class="p-6 text-center text-xs text-slate-600 border-t border-white/5 bg-black/10">
    <p>Powered by Kylrix Secure Cryptography Engine. This backup was decrypted entirely client-side. No passwords or secrets were sent over the internet.</p>
  </footer>

  <script>
    const CIPHERTEXT = "${ciphertext}";
    const SALT = "${salt}";
    const IV = "${iv}";

    let decryptedData = null;

    // Decrypt Function using Web Crypto API
    async function decryptBackup(password) {
      const encoder = new TextEncoder();
      const saltBuf = new Uint8Array(atob(SALT).split("").map(c => c.charCodeAt(0)));
      const ivBuf = new Uint8Array(atob(IV).split("").map(c => c.charCodeAt(0)));
      const encBuf = new Uint8Array(atob(CIPHERTEXT).split("").map(c => c.charCodeAt(0)));

      // Import plain password key material
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );

      // Derive AES key
      const key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: saltBuf,
          iterations: 100000,
          hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBuf },
        key,
        encBuf
      );

      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    }

    // Copy to clipboard helper
    function copyText(btn, text) {
      navigator.clipboard.writeText(text);
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="text-emerald-400">Copied!</span>';
      setTimeout(() => { btn.innerHTML = originalText; }, 1500);
    }

    // Toggle reveal password
    function togglePass(btn, inputId) {
      const input = document.getElementById(inputId);
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.innerHTML = isPassword ? 
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>' : 
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>';
    }

    // Render decrypted items
    function renderList(items, filter = "") {
      const tbody = document.getElementById("credentials-list");
      tbody.innerHTML = "";

      const query = filter.toLowerCase().trim();
      const filtered = items.filter(item => 
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.username && item.username.toLowerCase().includes(query)) ||
        (item.url && item.url.toLowerCase().includes(query))
      );

      document.getElementById("item-counter").innerText = \`Showing \${filtered.length} of \${items.length} items\`;

      if (filtered.length === 0) {
        tbody.innerHTML = \`<tr><td colspan="5" class="p-8 text-center text-slate-500 font-medium">No credentials match your search query.</td></tr>\`;
        return;
      }

      filtered.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-white/[0.02] transition-colors";
        
        const trId = \`pass-\${index}\`;

        tr.innerHTML = \`
          <td class="p-4 font-bold text-white max-w-[150px] truncate">\${item.name || 'Untitled'}</td>
          <td class="p-4 max-w-[180px] truncate">
            <div class="flex items-center gap-2">
              <span class="text-slate-300">\${item.username || ''}</span>
              \${item.username ? \`<button onclick="copyText(this, '\${item.username.replace(/'/g, "\\\\'")}')" class="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              </button>\` : ''}
            </div>
          </td>
          <td class="p-4">
            <div class="flex items-center gap-2">
              <input type="password" id="\${trId}" value="\${(item.password || '').replace(/"/g, '&quot;')}" readonly 
                class="bg-transparent border-none text-slate-300 select-all focus:outline-none w-[120px] font-mono text-sm">
              <button onclick="togglePass(this, '\${trId}')" class="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </button>
              <button onclick="copyText(this, '\${(item.password || '').replace(/'/g, "\\\\'")}')" class="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              </button>
            </div>
          </td>
          <td class="p-4 max-w-[150px] truncate">
            \${item.url ? \`<a href="\${item.url}" target="_blank" class="text-emerald-400 hover:underline flex items-center gap-1">
              \${item.url.replace(/^(https?:\\/\\/)?(www\\.)?/, '').substring(0, 20)}
              <svg class="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>\` : ''}
          </td>
          <td class="p-4 text-slate-400 max-w-[200px] truncate font-light" title="\${item.notes || ''}">\${item.notes || ''}</td>
        \`;
        tbody.appendChild(tr);
      });
    }

    // Event Handlers
    document.getElementById("unlock-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const pwd = document.getElementById("password").value;
      const btn = document.getElementById("unlock-btn");
      const errMsg = document.getElementById("error-message");

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin rounded-full h-4 w-4 border-b-2 border-black inline-block"></span> <span>Decrypting...</span>';
      errMsg.classList.add("hidden");

      try {
        const parsed = await decryptBackup(pwd);
        
        // Extract credentials
        let items = [];
        if (parsed.data && parsed.data.vault && parsed.data.vault.credentials) {
          items = parsed.data.vault.credentials;
        } else if (parsed.credentials) {
          items = parsed.credentials;
        } else if (Array.isArray(parsed)) {
          items = parsed;
        }
        
        decryptedData = parsed;
        
        // Date mapping
        const dateStr = parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleDateString() : 'Unknown date';
        document.getElementById("export-info").innerText = \`Exported on \${dateStr} with \${items.length} credentials\`;

        document.getElementById("unlock-screen").classList.add("hidden");
        document.getElementById("dashboard-screen").classList.remove("hidden");

        renderList(items);

        // Search listener
        document.getElementById("search-input").addEventListener("input", (e) => {
          renderList(items, e.target.value);
        });

      } catch (err) {
        console.error("Unlock failed", err);
        errMsg.classList.remove("hidden");
        btn.disabled = false;
        btn.innerHTML = '<span>Decrypt Backup</span>';
      }
    });

    // Download Decrypted JSON
    document.getElementById("download-json").addEventListener("click", () => {
      if (!decryptedData) return;
      const blob = new Blob([JSON.stringify(decryptedData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kylrix-vault-decrypted.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  </script>
</body>
</html>`;
}
