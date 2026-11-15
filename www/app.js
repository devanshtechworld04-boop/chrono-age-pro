// ==========================================
// 1. ADMOB CONFIGURATION (TEST ADS DEFAULT)
// తర్వాత ఇక్కడ మీ సొంత AdMob Unit IDs మార్చుకోండి
// ==========================================
const ADMOB_CONFIG = {
  isTesting: true, // మీ Live Ads పెట్టినప్పుడు false చేయండి
  bannerId: 'ca-app-pub-3940256099942544/6300978111',       // Google Test Banner ID
  interstitialId: 'ca-app-pub-3940256099942544/1033173712'  // Google Test Interstitial ID
};

let calcCount = 0;
let liveInterval = null;

async function initAdMob() {
  try {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
      const { AdMob } = window.Capacitor.Plugins;
      await AdMob.initialize({
        requestTrackingAuthorization: false,
        initializeForTesting: ADMOB_CONFIG.isTesting
      });

      await AdMob.showBanner({
        adId: ADMOB_CONFIG.bannerId,
        adSize: 'ADAPTIVE_BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
        isTesting: ADMOB_CONFIG.isTesting
      });

      await AdMob.prepareInterstitial({
        adId: ADMOB_CONFIG.interstitialId,
        isTesting: ADMOB_CONFIG.isTesting
      });
    }
  } catch (err) {
    console.log('AdMob init info:', err);
  }
}

async function triggerInterstitial() {
  try {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
      const { AdMob } = window.Capacitor.Plugins;
      await AdMob.showInterstitial();
      await AdMob.prepareInterstitial({
        adId: ADMOB_CONFIG.interstitialId,
        isTesting: ADMOB_CONFIG.isTesting
      });
    }
  } catch (err) {
    console.log('Interstitial skip:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initAdMob();

  const todayStr = new Date().toISOString().split('T')[0];
  document.getElementById('targetDateInput').value = todayStr;
  document.getElementById('dobInput').value = '1998-05-15';

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  renderSavedProfiles();
});

document.getElementById('calculateBtn').addEventListener('click', () => {
  const dobVal = document.getElementById('dobInput').value;
  const targetVal = document.getElementById('targetDateInput').value;

  if (!dobVal || !targetVal) {
    alert('Please select both dates.');
    return;
  }

  const dob = new Date(dobVal + 'T00:00:00');
  const target = new Date(targetVal + 'T00:00:00');

  if (dob > target) {
    alert('Date of Birth cannot be after Target Date!');
    return;
  }

  calculateAgeDetails(dob, target);
  document.getElementById('resultSection').classList.remove('hidden');

  calcCount++;
  if (calcCount % 3 === 0) {
    triggerInterstitial();
  }
});

function calculateAgeDetails(dob, target) {
  let years = target.getFullYear() - dob.getFullYear();
  let months = target.getMonth() - dob.getMonth();
  let days = target.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  document.getElementById('yearsVal').textContent = years;
  document.getElementById('monthsVal').textContent = months;
  document.getElementById('daysVal').textContent = days;

  const diffMs = target - dob;
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;

  document.getElementById('totalMonths').textContent = totalMonths.toLocaleString();
  document.getElementById('totalWeeks').textContent = totalWeeks.toLocaleString();
  document.getElementById('totalDays').textContent = totalDays.toLocaleString();
  document.getElementById('totalHours').textContent = totalHours.toLocaleString();

  let nextBday = new Date(target.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBday <= target) {
    nextBday.setFullYear(target.getFullYear() + 1);
  }
  const daysToBday = Math.ceil((nextBday - target) / (1000 * 60 * 60 * 24));
  const bdayMonths = Math.floor(daysToBday / 30.4375);
  const bdayRemDays = Math.floor(daysToBday % 30.4375);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  document.getElementById('nextBdayDay').textContent = dayNames[nextBday.getDay()];
  document.getElementById('nextBdayText').textContent = `${bdayMonths} Months, ${bdayRemDays} Days (${daysToBday} days left)`;

  const yearProgress = Math.min(100, Math.max(0, ((365 - daysToBday) / 365) * 100));
  document.getElementById('bdayProgress').style.width = `${yearProgress}%`;

  updateCosmicStats(dob, totalDays, dayNames[dob.getDay()]);

  if (liveInterval) clearInterval(liveInterval);
  liveInterval = setInterval(() => {
    const now = new Date();
    const secAlive = Math.floor((now - dob) / 1000);
    const hrs = Math.floor((secAlive % 86400) / 3600);
    const mins = Math.floor((secAlive % 3600) / 60);
    const secs = secAlive % 60;
    document.getElementById('liveTicker').textContent =
      `Live: ${String(hrs).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s`;
  }, 1000);
}

function updateCosmicStats(dob, totalDays, bornDayName) {
  document.getElementById('bornDayVal').textContent = bornDayName;
  document.getElementById('zodiacVal').textContent = getZodiac(dob.getMonth() + 1, dob.getDate());
  document.getElementById('mercuryVal').textContent = (totalDays / 87.97).toFixed(1) + ' yrs';
  document.getElementById('marsVal').textContent = (totalDays / 686.98).toFixed(1) + ' yrs';

  const heartbeats = Math.floor(totalDays * 24 * 60 * 72);
  document.getElementById('heartVal').textContent = (heartbeats / 1000000).toFixed(1) + 'M';

  let leaps = 0;
  const currentYear = new Date().getFullYear();
  for (let y = dob.getFullYear(); y <= currentYear; y++) {
    if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) leaps++;
  }
  document.getElementById('leapVal').textContent = leaps;
}

function getZodiac(month, day) {
  const signs = [
    ['Capricorn ♑', 20], ['Aquarius ♒', 19], ['Pisces ♓', 20], ['Aries ♈', 20],
    ['Taurus ♉', 21], ['Gemini ♊', 21], ['Cancer ♋', 22], ['Leo ♌', 23],
    ['Virgo ♍', 23], ['Libra ♎', 23], ['Scorpio ♏', 22], ['Sagittarius ♐', 22],
    ['Capricorn ♑', 31]
  ];
  return day < signs[month - 1][1] ? signs[month - 1][0] : signs[month][0];
}

document.getElementById('compareBtn').addEventListener('click', () => {
  const n1 = document.getElementById('p1Name').value || 'Person 1';
  const n2 = document.getElementById('p2Name').value || 'Person 2';
  const d1 = document.getElementById('p1Dob').value;
  const d2 = document.getElementById('p2Dob').value;

  if (!d1 || !d2) return alert('Select both birth dates.');

  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const older = date1 < date2 ? n1 : n2;
  const diffDays = Math.abs(Math.floor((date1 - date2) / (1000 * 60 * 60 * 24)));
  const y = Math.floor(diffDays / 365.25);
  const m = Math.floor((diffDays % 365.25) / 30.4375);
  const d = Math.floor((diffDays % 365.25) % 30.4375);

  const box = document.getElementById('compareResult');
  box.classList.remove('hidden');
  box.innerHTML = `<strong>${older}</strong> is older by:<br/>
    <span style="color:#a5b4fc; font-size:1.1rem; font-weight:bold;">${y} Years, ${m} Months, ${d} Days</span><br/>
    (${diffDays.toLocaleString()} total days difference)`;
});

document.getElementById('saveProfileBtn').addEventListener('click', () => {
  const dob = document.getElementById('dobInput').value;
  if (!dob) return alert('Select a Date of Birth first.');
  const name = prompt('Enter Name for this Birthday:');
  if (!name) return;

  const saved = JSON.parse(localStorage.getItem('chrono_profiles') || '[]');
  saved.push({ name, dob });
  localStorage.setItem('chrono_profiles', JSON.stringify(saved));
  renderSavedProfiles();
  alert('Profile Saved!');
});

function renderSavedProfiles() {
  const list = document.getElementById('savedList');
  const saved = JSON.parse(localStorage.getItem('chrono_profiles') || '[]');
  if (saved.length === 0) return;

  list.innerHTML = saved.map((item, idx) => `
    <div class="saved-item">
      <div onclick="loadProfile('${item.dob}')" style="cursor:pointer;">
        <strong>${item.name}</strong><br/>
        <small style="color:#94a3b8;">DOB: ${item.dob}</small>
      </div>
      <button onclick="deleteProfile(${idx})" style="background:none;border:none;color:#ef4444;font-size:1rem;">✕</button>
    </div>
  `).join('');
}

window.loadProfile = (dob) => {
  document.getElementById('dobInput').value = dob;
  document.querySelector('[data-tab="calculator"]').click();
  document.getElementById('calculateBtn').click();
};

window.deleteProfile = (idx) => {
  const saved = JSON.parse(localStorage.getItem('chrono_profiles') || '[]');
  saved.splice(idx, 1);
  localStorage.setItem('chrono_profiles', JSON.stringify(saved));
  renderSavedProfiles();
};

document.getElementById('shareResultBtn').addEventListener('click', async () => {
  const y = document.getElementById('yearsVal').textContent;
  const m = document.getElementById('monthsVal').textContent;
  const d = document.getElementById('daysVal').textContent;
  const text = `My exact age is ${y} Years, ${m} Months, and ${d} Days! Calculated via ChronoAge Pro.`;

  if (navigator.share) {
    await navigator.share({ title: 'ChronoAge Pro', text });
  } else {
    navigator.clipboard.writeText(text);
    alert('Age summary copied to clipboard!');
  }
});
  
