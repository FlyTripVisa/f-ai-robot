import html from './index.html';

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return new Response(html, { headers: { 'content-type': 'text/html' } });
    }

    if (url.pathname === '/api/chat') {
  try {
    const { msg } = await request.json();
    
    // AI রান করা হচ্ছে
    const stream = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [{ role: 'user', content: msg }],
      stream: true
    });

    // এখানে Response-কে একদম পরিষ্কারভাবে ট্রিমিং করে পাঠানো হচ্ছে
    return new Response(stream as ReadableStream, {
      headers: {
        'content-type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "AI Failed" }), { status: 500 });
  }
}