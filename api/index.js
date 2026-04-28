const axios = require('axios');

module.exports = async (req, res) => {
  // 1. 使用你截图中的 ScrapingAnt API Token
  const apiKey = "10f24def57b343d2872fffac037670cf";
  const targetUrl = "https://www.domain.com.au/property-profile/62-arab-road-padstow-nsw-2211";
  
  // 2. 构造 ScrapingAnt 代理请求
  // browser=false 提高响应速度，通过住宅代理绕过封锁
  const proxyUrl = `https://api.scraperant.com/v2/general?url=${encodeURIComponent(targetUrl)}&x-api-key=${apiKey}&browser=false`;

  try {
    const response = await axios.get(proxyUrl, { timeout: 25000 });
    const html = response.data;

    // 3. 提取动态数据
    // 匹配房价：寻找 Estimated value 后的金额
    const priceMatch = html.match(/Estimated\s+value.*?\$([\d,]+)/i);
    // 匹配租金：寻找 rent 关键字后的金额
    const rentMatch = html.match(/rent.*?\$([\d,]+)/i);

    // 如果匹配成功则去掉逗号，匹配失败则返回 0
    let price = priceMatch ? priceMatch[1].replace(/,/g, '') : "0";
    let rent = rentMatch ? rentMatch[1].replace(/,/g, '') : "0";

    // 4. 极端情况保底：如果正则没对上，但在源码里能找到金额，尝试暴力提取第一个大额数字
    if (price === "0") {
      const backupPrice = html.match(/\$([1-2][\d,]{6})/);
      if (backupPrice) price = backupPrice[1].replace(/,/g, '');
    }

    // 输出纯文本格式，方便 ESP32 解析
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`${price},${rent}`);

  } catch (error) {
    // 打印错误到 Vercel 日志
    console.error("ScrapingAnt Error:", error.message);
    
    // 如果是 API 次数用尽或超时，返回特定标识
    res.status(200).send("error_fetch,0");
  }
};
