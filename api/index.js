const axios = require('axios');

module.exports = async (req, res) => {
  const url = "https://www.property.com.au/nsw/padstow-2211/arab-rd/62-pid-63112/";
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
        'Accept-Encoding': 'identity'
      },
      timeout: 10000
    });

    const html = response.data;
    
    // 正则提取：匹配 property value 和 rental income 后的美元数字
    const priceMatch = html.match(/property\s+value.*?\$([\d,]+)/i);
    const rentMatch = html.match(/rental\s+income.*?\$([\d,]+)/i);

    let price = priceMatch ? priceMatch[1].replace(/,/g, '') : "0";
    let rent = rentMatch ? rentMatch[1].replace(/,/g, '') : "0";

    // 保底逻辑：如果上方匹配失败，搜寻页面中最大的 100w 级数字作为房价
    if (price === "0") {
      const allPrices = html.match(/\$([1-9][\d,]{5,8})/g);
      if (allPrices) price = allPrices[0].replace(/[$,]/g, '');
    }

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`${price},${rent}`);
  } catch (error) {
    res.status(200).send("0,0");
  }
};
