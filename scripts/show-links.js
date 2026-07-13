import os from 'node:os'

function getNetworkIps() {
  const nets = os.networkInterfaces()
  const results = []
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address)
      }
    }
  }
  return results
}

const ips = getNetworkIps()
const PROD_PORT = process.env.PORT || 3001
const DEV_PORT = 5173

console.log('\n  ╔═════════════════════════════════════════════════════════════════════╗')
console.log('  ║ 🔗 VOCABASE AKADEMİK - ERİŞİM LİNKLERİ (VS CODE TERMINAL)           ║')
console.log('  ╠═════════════════════════════════════════════════════════════════════╣')
console.log('  ║ 🎯 CANLI / PROD SUNUCU (npm start veya PM2 ile çalışırken):         ║')
console.log(`  ║    👉 Yerel (Localhost):       http://localhost:${PROD_PORT}                   ║`)
console.log(`  ║    👉 Yerel (IP):              http://127.0.0.1:${PROD_PORT}                   ║`)
if (ips.length > 0) {
  ips.forEach(ip => {
    console.log(`  ║    👉 Ağ / Wi-Fi (Network):    http://${ip}:${PROD_PORT}                  ║`)
  })
}
console.log('  ╠─────────────────────────────────────────────────────────────────────╣')
console.log('  ║ 🛠️ GELİŞTİRİCİ / DEV MODU (npm run dev çalışırken):                 ║')
console.log(`  ║    👉 Yerel Dev Sunucusu:      http://localhost:${DEV_PORT}                   ║`)
if (ips.length > 0) {
  ips.forEach(ip => {
    console.log(`  ║    👉 Ağ/LAN Dev Sunucusu:     http://${ip}:${DEV_PORT}                  ║`)
  })
}
console.log('  ╠═════════════════════════════════════════════════════════════════════╣')
console.log('  ║ 💡 İPUCU: VS Code terminalinde yukarıdaki linklerden herhangi       ║')
console.log('  ║    birinin üzerine gelip  [ Ctrl + Tık ]  (veya Mac: Cmd + Tık)    ║')
console.log('  ║    yaparak tarayıcınızda tek tıkla açabilirsiniz!                   ║')
console.log('  ╚═════════════════════════════════════════════════════════════════════╝\n')
