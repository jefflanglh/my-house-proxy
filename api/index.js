const axios = require('axios');

module.exports = async (req, res) => {
  // 切换到 Domain 的房产页面，该网站对云服务 IP 较友好
  const url = "https://www.domain.com.au/property-profile/62-arab-road-padstow-nsw-2211";
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
      },
      timeout: 10000
    });

    const html = response.data;
    
    // 1. 尝试匹配房价（Domain 的格式通常包含在 "Estimated value" 附近）
    const priceMatch = html.match(/Estimated\s+value.*?\$([\d,]+)/i) || 
                       html.match(/\"price\"\s*:\s*\"\$([\d,]+)\"/i);
    
    // 2. 尝试匹配租金
    const rentMatch = html.match(/rent.*?\$([\d,]+)/i);

    let price = priceMatch ? priceMatch[1].replace(/,/g, '') : "0";
    let rent = rentMatch ? rentMatch[1].replace(/,/g, '') : "0";

    // 3. 保底：寻找页面中最大的金额作为房价
    if (price === "0") {
      const allPrices = html.match(/\$([1-9][\d,]{5,8})/g);
      if (allPrices) price = allPrices[0].replace(/[$,]/g, '');
    }

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`${price},${rent}`);
  } catch (error) {
    // 如果还是被封锁，返回 error 标识
    res.status(200).send("error,0");
  }
};
