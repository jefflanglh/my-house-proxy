const axios = require('axios');

module.exports = async (req, res) => {
  const apiKey = "10f24def57b343d2872fffac037670cf";
  const targetUrl = "https://www.domain.com.au/property-profile/62-arab-road-padstow-nsw-2211";
  
  // 核心改动：
  // 1. browser=true: 开启浏览器仿真，让网站以为是真人在用 Chrome 看网页
  // 2. ant_proxy=residential: 强制使用澳洲住宅 IP
  const proxyUrl = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(targetUrl)}&x-api-key=${apiKey}&browser=true&ant_proxy=residential`;

  try {
    // 浏览器渲染比较慢，超时时间延长到 30 秒
    const response = await axios.get(proxyUrl, { timeout: 35000 });
    const html = response.data;

    // 数据提取逻辑
    const priceMatch = html.match(/Estimated\s+value.*?\$([\d,]+)/i) || html.match(/\$([1-2][\d,]{6})/);
    const rentMatch = html.match(/rent.*?\$([\d,]+)/i) || html.match(/\$([5-9][\d]{2})/);

    let price = priceMatch ? priceMatch[1].replace(/,/g, '') : "0";
    let rent = rentMatch ? rentMatch[1].replace(/,/g, '') : "0";

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`${price},${rent}`);

  } catch (error) {
    console.error("Final Attempt Error:", error.message);
    res.status(200).send("waiting_for_data,0");
  }
};
