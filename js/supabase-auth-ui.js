// yerramazing — Auth UI Overlay
// Adds login/logout UI to any page that includes this script

function createAuthUI() {
  // Auth bar at top
  const bar = document.createElement('div');
  bar.id = 'auth-bar';
  bar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#fff;border-bottom:1px solid #e5e5e5;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;font-size:12px;font-family:-apple-system,sans-serif;z-index:9999;gap:8px';
  bar.innerHTML = `
    <div id="auth-status" style="color:#999">Checking...</div>
    <div id="auth-actions"></div>
  `;
  document.body.prepend(bar);

  // Add top padding to body so content isn't hidden
  document.body.style.paddingTop = '44px';

  // Login overlay
  const overlay = document.createElement('div');
  overlay.id = 'auth-overlay';
  overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px;max-width:360px;width:90%;text-align:center;font-family:-apple-system,sans-serif">
      <h2 style="font-size:18px;margin-bottom:4px">Sign In</h2>
      <p style="font-size:12px;color:#666;margin-bottom:20px">Magic link — no password needed</p>
      <input id="auth-email" type="email" placeholder="Your email" style="width:100%;padding:12px;border:1px solid #e5e5e5;border-radius:8px;font-size:14px;margin-bottom:12px;box-sizing:border-box">
      <button id="auth-submit" style="width:100%;padding:12px;background:#534AB7;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Send Magic Link</button>
      <div id="auth-msg" style="font-size:12px;color:#43A047;margin-top:12px;display:none"></div>
      <button onclick="document.getElementById('auth-overlay').style.display='none'" style="margin-top:16px;background:none;border:none;color:#999;font-size:12px;cursor:pointer">Cancel</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Wire up submit
  document.getElementById('auth-submit').addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value.trim();
    if (!email) return;
    const btn = document.getElementById('auth-submit');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    const { error } = await signInWithEmail(email);
    const msg = document.getElementById('auth-msg');
    msg.style.display = 'block';
    if (error) {
      msg.style.color = '#d32f2f';
      msg.textContent = error.message || 'Error sending link';
    } else {
      msg.style.color = '#43A047';
      msg.textContent = 'Check your email for the magic link!';
    }
    btn.disabled = false;
    btn.textContent = 'Send Magic Link';
  });

  // Enter key on email input
  document.getElementById('auth-email').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('auth-submit').click();
  });
}

function updateAuthUI(session) {
  const status = document.getElementById('auth-status');
  const actions = document.getElementById('auth-actions');
  if (!status || !actions) return;

  if (session?.user) {
    status.innerHTML = `<span style="color:#43A047;font-weight:600">●</span> ${session.user.email}`;
    actions.innerHTML = `<button onclick="handleSignOut()" style="font-size:11px;padding:4px 10px;border:1px solid #e5e5e5;border-radius:6px;background:#fff;cursor:pointer">Sign Out</button>`;
    document.getElementById('auth-overlay').style.display = 'none';
  } else {
    status.textContent = 'Not signed in';
    actions.innerHTML = `<button onclick="document.getElementById('auth-overlay').style.display='flex'" style="font-size:11px;padding:4px 10px;border:1px solid #534AB7;border-radius:6px;background:#EEEDFE;color:#534AB7;cursor:pointer;font-weight:600">Sign In</button>`;
  }
}

async function handleSignOut() {
  await signOut();
  updateAuthUI(null);
}

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  createAuthUI();
  const session = await getSession();
  updateAuthUI(session);
  onAuthChange((session) => {
    updateAuthUI(session);
    // Trigger sync on sign-in
    if (session?.user && typeof onAuthSync === 'function') {
      onAuthSync();
    }
  });
});
