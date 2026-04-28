const axios = require('axios');

module.exports = async (req, res) => {
  // 目标地址
  const targetUrl = "https://www.domain.com.au/property-profile/62-arab-road-padstow-nsw-2211";
  
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/ *;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.google.com/'
      },
      timeout: 12000
    });

    const html = response.data;
    
    // 1. 动态抓取房价：Domain 页面通常将数据存在 JSON 脚本标签中，这里直接从源码全局搜寻金额
    // 寻找像 $1,460,000 这样的大额数字
    const priceMatches = html.match(/\$([1-9][\d,]{5,8})/g);
    // 寻找租金规律（通常是 $ 后面跟着 3 位数）
    const rentMatches = html.match(/\$([5-9][\d]{2})/g);

    let price = "0";
    let rent = "0";

    if (priceMatches) {
        // 取第一个匹配到的大额数字，去掉符号
        price = priceMatches[0].replace(/[$,]/g, '');
    }
    
    if (rentMatches) {
        // 取租金匹配结果
        rent = rentMatches[0].replace(/[$,]/g, '');
    }

    // 只有在完全抓不到时才报 0，绝不写死
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`${price},${rent}`);

  } catch (error) {
    // 打印具体错误到 Vercel Logs，方便排查是超时还是被封
    console.error("Fetch Error:", error.message);
    res.status(200).send(`fetch_error,0`);
  }
};
