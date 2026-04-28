from http.server import BaseHTTPRequestHandler
import requests
import re

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 目标房产页面
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
            html = res.text
            
            # 方案 A：使用关键词提取（增加容错）
            price_match = re.search(r'property\s+value.*?\$([\d,]+)', html, re.IGNORECASE)
            rent_match = re.search(r'rental\s+income.*?\$([\d,]+)', html, re.IGNORECASE)
            
            p_val = price_match.group(1).replace(',', '') if price_match else "0"
            r_val = rent_match.group(1).replace(',', '') if rent_match else "0"

            # 方案 B：如果 A 失败，提取页面中所有 $ 后的数字并按大小排序
            if p_val == "0":
                all_amounts = re.findall(r'\$([\d,]+)', html)
                # 转换成纯数字列表并过滤
                nums = []
                for a in all_amounts:
                    clean_n = int(a.replace(',', ''))
                    if clean_n > 100: # 排除极小的数字
                        nums.append(clean_n)
                
                if nums:
                    nums = sorted(list(set(nums)), reverse=True)
                    # 通常最大的数字是房价，1000 左右的是租金
                    p_val = str(nums[0])
                    # 寻找 300-3000 之间的数字作为租金
                    for n in nums:
                        if 300 < n < 5000:
                            r_val = str(n)
                            break
            
            output = f"{p_val},{r_val}"
            self.wfile.write(output.encode('utf-8'))
            
        except Exception as e:
            self.wfile.write("0,0".encode('utf-8'))
