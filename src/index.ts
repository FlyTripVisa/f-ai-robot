import html from './index.html';

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return new Response(html, { headers: { 'content-type': 'text/html' } });
    }

    if (url.pathname === '/api/chat') {
      const { msg } = await request.json();
      const stream = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [{ role: 'user', content: msg }],
        stream: true
      });
      return new Response(stream as any, { headers: { 'content-type': 'text/event-stream' } });
    }

    return new Response('Not Found', { status: 404 });
  }
};
