from http.server import BaseHTTPRequestHandler
import requests
import re

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 目标房产页面
        url = "https://www.property.com.au/nsw/padstow-2211/arab-rd/62-pid-63112/"
        
        # 模拟高权重浏览器 Header，避免被拦截
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'text/plain; charset=utf-8')
        self.end_headers()
        
        try:
            # Vercel 服务器去请求目标网站
            res = requests.get(url, headers=headers, timeout=10)
            html = res.text
            
            # 使用正则提取价格和租金
            price_match = re.search(r'property value of.*?\$([\d,]+)', html)
            rent_match = re.search(r'rental income of.*?\$([\d,]+)', html)
            
            # 清理数据：去掉逗号，只留纯数字方便 ESP32 处理
            p_val = price_match.group(1).replace(',', '') if price_match else "0"
            r_val = rent_match.group(1).replace(',', '') if rent_match else "0"
            
            # 最终返回给 ESP32 的字符串格式：价格,租金
            output = f"{p_val},{r_val}"
            self.wfile.write(output.encode('utf-8'))
            
        except Exception as e:
            # 如果出错，返回 0,0 避免 ESP32 崩溃
            self.wfile.write("0,0".encode('utf-8'))
