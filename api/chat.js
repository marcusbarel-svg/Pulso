
fetch('/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({messages:[], memory: null})}).then(r=>r.json()).then(console.log).catch(console.error)
