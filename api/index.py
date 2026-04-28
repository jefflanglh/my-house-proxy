from http.server import BaseHTTPRequestHandler
import requests
import re

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 目标房产页面
        url = "https://www.property.com.au/nsw/padstow-2211/arab-rd/62-pid-63112/"
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-AU,en;q=0.9",
            "Accept-Encoding": "gzip, deflate",  # 告诉服务器我们可以处理压缩
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'text/plain; charset=utf-8')
        self.end_headers()
        
        try:
            # 使用 requests 自动处理解压
            res = requests.get(url, headers=headers, timeout=15)
            html = res.text  # requests 会根据 Header 自动解密/解压乱码
            
            # --- 根据你提供的源码截图进行精准匹配 ---
            # 源码中是 "...property value of 62 Arab Rd... is $1,460,000"
            price_match = re.search(r'property\s+value.*?\$([\d,]+)', html, re.IGNORECASE | re.DOTALL)
            rent_match = re.search(r'rental\s+income.*?\$([\d,]+)', html, re.IGNORECASE | re.DOTALL)
            
            p_val = price_match.group(1).replace(',', '') if price_match else "0"
            r_val = rent_match.group(1).replace(',', '') if rent_match else "0"

            # 如果精准匹配失败，使用保底方案（提取所有金额并按大小归类）
            if p_val == "0":
                all_amounts = re.findall(r'\$([\d,]+)', html)
                nums = sorted([int(a.replace(',', '')) for a in all_amounts], reverse=True)
                if nums:
                    p_val = str(nums[0]) # 最大的通常是房价
                    for n in nums:
                        if 300 < n < 3000: # 寻找合理的周租金范围
                            r_val = str(n)
                            break
            
            print(f"Final Result: {p_val},{r_val}")
            self.wfile.write(f"{p_val},{r_val}".encode('utf-8'))
            
        except Exception as e:
            print(f"Error: {str(e)}")
            self.wfile.write("0,0".encode('utf-8'))
