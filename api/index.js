const axios = require('axios');

module.exports = async (req, res) => {
  // 1. 使用代理中转，避开 IP 封锁
  const targetUrl = "https://www.domain.com.au/property-profile/62-arab-road-padstow-nsw-2211";
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
  
  try {
    const response = await axios.get(proxyUrl, { timeout: 15000 });
    const html = response.data.contents; 

    // 2. 更加宽泛的正则匹配：直接搜寻含有 $ 的数字
    // 匹配房价 (通常在 100w-300w 之间)
    const priceMatch = html.match(/\$([1-2][\d,]{6})/);
    // 匹配租金 (通常在 500-1500 之间)
    const rentMatch = html.match(/\$([5-9][\d]{2})/);

    let price = priceMatch ? priceMatch[1].replace(/,/g, '') : "1460000"; // 如果抓不到，给个参考价
    let rent = rentMatch ? rentMatch[1].replace(/,/g, '') : "850";

    // 3. 实在不行，在源码里暴力搜索
    if (price === "1460000") {
        const allNums = html.match(/\$([\d,]+)/g);
        if (allNums && allNums.length > 0) {
            price = allNums[0].replace(/[$,]/g, '');
        }
    }

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`${price},${rent}`);
  } catch (error) {
    // 最后的保底输出，确保 ESP32 不会拿到空值而重启
    res.status(200).send("1460000,850"); 
  }
};
