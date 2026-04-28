from http.server import BaseHTTPRequestHandler
import requests
import re

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = "https://www.property.com.au/nsw/padstow-2211/arab-rd/62-pid-63112/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-AU,en;q=0.9",
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'text/plain; charset=utf-8')
        self.end_headers()
        
        try:
            res = requests.get(url, headers=headers, timeout=15)
            # --- 关键调试日志 ---
            print(f"HTTP Status: {res.status_code}")
            print(f"HTML Snippet: {res.text[:500]}") 
            
            html = res.text
            
            # 尝试匹配
            price_match = re.search(r'property\s+value.*?\$([\d,]+)', html, re.IGNORECASE)
            rent_match = re.search(r'rental\s+income.*?\$([\d,]+)', html, re.IGNORECASE)
            
            p_val = price_match.group(1).replace(',', '') if price_match else "0"
            r_val = rent_match.group(1).replace(',', '') if rent_match else "0"

            # 如果还是 0，尝试最后的保底搜索
            if p_val == "0":
                all_nums = re.findall(r'\$([\d,]+)', html)
                print(f"Found all dollar amounts: {all_nums}")
                if all_nums:
                    # 简单逻辑：最大的数通常是房价
                    nums = sorted([int(x.replace(',', '')) for x in all_nums], reverse=True)
                    p_val = str(nums[0])
                    for n in nums:
                        if 400 < n < 3000:
                            r_val = str(n)
                            break
            
            self.wfile.write(f"{p_val},{r_val}".encode('utf-8'))
            
        except Exception as e:
            print(f"Error: {str(e)}")
            self.wfile.write("0,0".encode('utf-8'))
