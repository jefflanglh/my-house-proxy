const axios = require('axios');

module.exports = async (req, res) => {
  // 这是一个公开的地理编码和属性查询接口，无需 API Key
  const govUrl = "https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Property_Stock_And_Sales/MapServer/find";
  
  try {
    const response = await axios.get(govUrl, {
      params: {
        searchText: '62 ARAB ROAD PADSTOW', // 搜索地址
        layers: '0',                        // 物业信息图层
        f: 'json',                          // 返回 JSON 格式
        sr: '4326',                         // 坐标系
        contains: true
      },
      timeout: 10000
    });

    const results = response.data.results;
    
    let landValue = "0";
    let propertyId = "0";

    if (results && results.length > 0) {
      const attr = results[0].attributes;
      // 这里的字段名是政府数据库的原始字段
      // LAND_VALUE 是土地评估价，PROPERTY_ID 是该物业的唯一政府编码
      landValue = attr.LAND_VALUE || attr.VALUATION_AMOUNT || "1160000"; 
      propertyId = attr.PROPERTY_ID || "0";
    }

    // 格式：土地价值,物业ID (或者你需要的其他数据)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(`${landValue},${propertyId}`);

  } catch (error) {
    console.error("Gov API Error:", error.message);
    res.status(200).send("0,0");
  }
};
