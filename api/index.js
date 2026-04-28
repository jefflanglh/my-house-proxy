const axios = require('axios');

module.exports = async (req, res) => {
  // 1. NSW 政府官方地理编码与属性服务接口
  const searchUrl = "https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addresses/MapServer/find";
  const valuationUrl = "https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Property_Stock_And_Sales/MapServer/find";
  
  try {
    // 第一步：通过地址获取该物业的官方 Property ID (PID)
    const geoResponse = await axios.get(searchUrl, {
      params: {
        searchText: '62 ARAB RD PADSTOW', // 政府数据库通常使用 RD 缩写
        layers: '0',
        f: 'json',
        sr: '4326',
        contains: true
      },
      timeout: 8000
    });

    const geoResults = geoResponse.data.results;
    if (!geoResults || geoResults.length === 0) {
      return res.status(200).send("address_not_found,0");
    }

    // 提取 Property ID
    const pid = geoResults[0].attributes.PROPERTY_ID || geoResults[0].attributes.PROP_ID;

    // 第二步：使用获取到的 PID 精准查询土地价值
    const valResponse = await axios.get(valuationUrl, {
      params: {
        searchText: pid,
        layers: '0', 
        f: 'json',
        sr: '4326'
      },
      timeout: 8000
    });

    const valResults = valResponse.data.results;
    let landValue = "0";

    if (valResults && valResults.length > 0) {
      const attr = valResults[0].attributes;
      // 获取估价金额 (VALN_AMT 是该图层的标准数值字段)
      landValue = attr.VALN_AMT || attr.LAND_VALUE || attr.VALUATION_AMOUNT || "0";
    }

    // 设置返回头，确保 ESP32 拿到的只有纯数字字符串
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(`${landValue},${pid}`);

  } catch (error) {
    // 只有在政府服务器宕机或网络中断时才会触发
    console.error("API Fetch Failed:", error.message);
    res.status(200).send("service_unavailable,0");
  }
};
