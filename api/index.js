const axios = require('axios');

module.exports = async (req, res) => {
  // 1. 确认使用你截图中的 Token
  const apiKey = "10f24def57b343d2872fffac037670cf";
  const targetUrl = "https://www.domain.com.au/property-profile/62-arab-road-padstow-nsw-2211";
  
  // 2. 修正后的正确 API 地址: api.scrapingant.com (注意中间的 'ing')
  const proxyUrl = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(targetUrl)}&x-api-key=${apiKey}&browser=false`;

  try {
    // 设置较长的超时时间，因为代理请求需要时间转发
    const response = await axios.get(proxyUrl, { timeout: 25000 });
    const html = response.data;

    // 3. 数据提取逻辑
    // 匹配房价 (例如 $1,460,000)
    const priceMatch = html.match(/Estimated\s+value.*?\$([\d,]+)/i) || html.match(/\$([1-2][\d,]{6})/);
    // 匹配租金 (例如 $850)
    const rentMatch = html.match(/rent.*?\$([\d,]+)/i) || html.match(/\$([5-9][\d]{2})/);

    let price = priceMatch ? priceMatch[1].replace(/,/g, '') : "0";
    let rent = rentMatch ? rentMatch[1].replace(/,/g, '') : "0";

    // 设置为纯文本返回，方便 ESP32 解析
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`${price},${rent}`);

  } catch (error) {
    // 将详细错误打印到 Vercel Logs，方便你观察
    console.error("Scraping Error:", error.message);
    res.status(200).send("error_connection,0");
  }
};
