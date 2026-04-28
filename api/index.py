from http.server import BaseHTTPRequestHandler
import requests
import re
import time

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = "https://www.property.com.au/nsw/padstow-2211/arab-rd/62-pid-63112/"
        
        # 创建一个 Session 对象，模拟浏览器的持续访问
        session = requests.Session()
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-AU,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'text/plain; charset=utf-8')
        self.end_headers()
        
        try:
            # 1. 先访问首页，获取必要的 Cookie
            session.get("https://www.property.com.au/", headers=headers, timeout=5)
            time.sleep(1) # 稍微停顿，模拟真人
            
            # 2. 带着 Cookie 访问目标房产页
            res = session.get(url, headers=headers, timeout=10)
            html = res.text
            
            # 打印前200字到日志，看看是不是又撞见人机验证了
            print(f"DEBUG HTML: {html[:200]}")
            
            # 尝试多种正则匹配方式
            # 方式1：匹配价格
            p_match = re.search(r'property\s+value.*?\$([\d,]+)', html, re.I | re.S)
            # 方式2：匹配租金
            r_match = re.search(r'rental\s+income.*?\$([\d,]+)', html, re.I | re.S)
            
            p_val = p_match.group(1).replace(',', '') if p_match else "0"
            r_val = r_match.group(1).replace(',', '') if r_match else "0"
            
            # 方式3：如果还是没找到，暴力搜索页面上所有的数字
            if p_val == "0":
                all_prices = re.findall(r'\$([\d,]{5,9})', html) # 寻找5-9位的金钱数字
                if all_prices:
                    p_val = all_prices[0].replace(',', '')
                
                all_rents = re.findall(r'\$([\d,]{3,4})', html) # 寻找3-4位的金钱数字
                if all_rents:
                    r_val = all_rents[0].replace(',', '')

            self.wfile.write(f"{p_val},{r_val}".encode('utf-8'))
            
        except Exception as e:
            print(f"ERROR: {str(e)}")
            self.wfile.write("0,0".encode('utf-8'))
