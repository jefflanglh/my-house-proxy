const axios = require('axios');

module.exports = async (req, res) => {
  // 使用 AllOrigins 这种免费的中转服务来躲避封锁
  const targetUrl = "https://www.property.com.au/nsw/padstow-2211/arab-rd/62-pid-63112/";
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
  
  try {
    const response = await axios.get(proxyUrl, { timeout: 15000 });
    const html = response.data.contents; // allorigins 会把网页内容放在 contents 字段里
    
    // 匹配房价和租金
    const priceMatch = html.match(/property\s+value.*?\$([\d,]+)/i);
    const rentMatch = html.match(/rental\s+income.*?\$([\d,]+)/i);

    let price = priceMatch ? priceMatch[1].replace(/,/g, '') : "0";
    let rent = rentMatch ? rentMatch[1].replace(/,/g, '') : "0";

    // 保底：搜寻 100w 级数字
    if (price === "0") {
      const allPrices = html.match(/\$([1-9][\d,]{5,8})/g);
      if (allPrices) price = allPrices[0].replace(/[$,]/g, '');
    }

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`${price},${rent}`);
  } catch (error) {
    res.status(200).send("error,0");
  }
};
