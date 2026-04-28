from http.server import BaseHTTPRequestHandler
import requests
import re

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = "https://www.property.com.au/nsw/padstow-2211/arab-rd/62-pid-63112/"
        
        # 更加真实的浏览器伪装
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-AU,en;q=0.9",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'text/plain; charset=utf-8')
        self.end_headers()
        
        try:
            # 禁用 SSL 验证警告，提高成功率
            res = requests.get(url, headers=headers, timeout=15)
            html = res.text
            
            # --- 改进后的正则表达式 ---
            # 1. 匹配价格：寻找 "property value" 后面出现的第一个 $ 符号及其数字
            price_match = re.search(r'property\s+value.*?\$([\d,]+)', html, re.IGNORECASE)
            
            # 2. 匹配租金：寻找 "rental income" 后面出现的第一个 $ 符号及其数字
            rent_match = re.search(r'rental\s+income.*?\$([\d,]+)', html, re.IGNORECASE)
            
            # 数据清洗
            p_val = price_match.group(1).replace(',', '') if price_match else "0"
            r_val = rent_match.group(1).replace(',', '') if rent_match else "0"
            
            # 如果依然是0,0，可以在日志输出一段源码片段调试（可选）
            if p_val == "0":
                print("Debug: Price not found in HTML")
            
            output = f"{p_val},{r_val}"
            self.wfile.write(output.encode('utf-8'))
            
        except Exception as e:
            self.wfile.write(f"Error: {str(e)}".encode('utf-8'))
