from http.server import BaseHTTPRequestHandler
import requests

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = "https://www.property.com.au/nsw/padstow-2211/arab-rd/62-pid-63112/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-AU,en;q=0.9",
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'text/plain; charset=utf-8')
        self.end_headers()
        
        try:
            res = requests.get(url, headers=headers, timeout=15)
            # 直接返回前 1000 个字符给浏览器看
            self.wfile.write(res.text[:1000].encode('utf-8'))
        except Exception as e:
            self.wfile.write(f"Error: {str(e)}".encode('utf-8'))
