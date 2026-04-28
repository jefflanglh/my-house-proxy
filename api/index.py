from http.server import BaseHTTPRequestHandler
import requests
import re

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
            # 1. 拿到原始网页
            raw_html = res.text 
            
            # 2. 暴力去掉所有 HTML 标签，只保留文本内容
            clean_text = re.sub(r'<[^>]+>', ' ', raw_html)
            # 压缩多余的空格
            clean_text = ' '.join(clean_text.split())
            
            # 打印一小段纯文本到日志，方便我们排查
            print(f"Clean Text Snippet: {clean_text[:300]}")
            
            # 3. 在纯文本里匹配
            # 匹配价格 (寻找 "property value" 后的数字)
            p_match = re.search(r'property\s+value.*?\$([\d,]+)', clean_text, re.I)
            # 匹配租金 (寻找 "rental income" 后的数字)
            r_match = re.search(r'rental\s+income.*?\$([\d,]+)', clean_text, re.I)
            
            p_val = p_match.group(1).replace(',', '') if p_match else "0"
            r_val = r_match.group(1).replace(',', '') if r_match else "0"

            # 4. 保底方案：如果还是 0，直接搜页面上最大的金额
            if p_val == "0":
                all_dollars = re.findall(r'\$([\d,]+)', clean_text)
                nums = sorted([int(x.replace(',', '')) for x in all_dollars], reverse=True)
                if nums:
                    p_val = str(nums[0])
                    for n in nums:
                        if 400 < n < 4000:
                            r_val = str(n)
                            break
            
            print(f"Final Outcome: {p_val},{r_val}")
            self.wfile.write(f"{p_val},{r_val}".encode('utf-8'))
            
        except Exception as e:
            print(f"Error: {str(e)}")
            self.wfile.write("0,0".encode('utf-8'))
