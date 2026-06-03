export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response('Missing url parameter', { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
    });

    let html = await res.text();

    // 注入 <base> 标签，让相对路径资源正确加载
    const baseUrl = new URL(url).origin;
    html = html.replace(
      '<head>',
      `<head><base href="${baseUrl}/" />`
    );

    // 移除阻止 iframe 嵌入的响应头
    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('X-Frame-Options', 'ALLOWALL');
    // 移除 CSP 中限制 frame 祖先的指令
    const originalCsp = res.headers.get('content-security-policy') || '';
    const relaxedCsp = originalCsp
      .replace(/frame-ancestors[^;]+;?/gi, '')
      .trim();
    if (relaxedCsp) {
      headers.set('Content-Security-Policy', relaxedCsp);
    }

    return new Response(html, { headers });
  } catch (error) {
    return new Response(
      `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#999;">
        <p>资讯加载失败，请稍后重试</p>
      </body></html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }
}