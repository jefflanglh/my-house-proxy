const axios = require('axios');

module.exports = async (req, res) => {
  // 62 Arab Road, Padstow 的官方属性查询接口
  // 这是一个公开的公共地理信息系统接口，非常稳定
  const govUrl = "https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Property_Stock_And_Sales/MapServer/find";
  
  try {
    const response = await axios.get(govUrl, {
      params: {
        searchText: '62 ARAB ROAD PADSTOW',
        layers: '0', 
        f: 'json',
        sr: '4326',
        contains: true
      },
      timeout: 8000 // 这种 API 响应极快，无需 30 秒
    });

    const results = response.data.results;
    
    // 默认返回值，如果没查到则显示 0
    let landValue = "0";
    let propId = "0";

    if (results && results.length > 0) {
      // 提取政府原始字段
      const attr = results[0].attributes;
      // 核心：LAND_VALUE 是土地税依据，PROPERTY_ID 是官方编码
      landValue = attr.LAND_VALUE || attr.VALUATION_AMOUNT || "0";
      propId = attr.PROPERTY_ID || "0";
    }

    // 设置 Content-Type 为文本，方便 ESP32 直接读取
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(`${landValue},${propId}`);

  } catch (error) {
    // 只有网络完全断掉才会进这里
    res.status(200).send("connection_error,0");
  }
};
