const html = `<!DOCTYPE html>
<html data-theme="dark">
<head>
    <meta charset="UTF-8"><title>FlyTripChat</title>
    <style>
        body { background: #161616; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .box { width: 90%; max-width: 600px; background: #2a2a2a; border-radius: 20px; padding: 20px; }
        #input { width: 100%; border: none; background: none; color: white; outline: none; font-size: 16px; margin-bottom: 10px; }
        .footer { display: flex; justify-content: space-between; border-top: 1px solid #444; padding-top: 10px; }
        #output { margin-top: 20px; width: 90%; max-width: 600px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="box">
        <input type="text" id="input" placeholder="Ask anything privately...">
        <div class="footer"><span>📎 ⚙️ ⚡ 5.4-nano ▾</span><button onclick="send()">Ask</button></div>
    </div>
    <div id="output"></div>
    <script>
        async function send() {
            const msg = document.getElementById('input').value;
            const output = document.getElementById('output');
            output.innerText = "";
            const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ msg }) });
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            while(true) {
                const {done, value} = await reader.read();
                if(done) break;
                output.innerText += decoder.decode(value);
            }
        }
    </script>
</body>
</html>`;

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/') return new Response(html, { headers: { 'content-type': 'text/html' } });
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      const { msg } = await request.json();
      const stream = await env.AI.run('@cf/meta/llama-3-8b-instruct', { messages: [{ role: 'user', content: msg }], stream: true });
      return new Response(stream as any, { headers: { 'content-type': 'text/event-stream' } });
    }
    return new Response('Not Found', { status: 404 });
  }
};
