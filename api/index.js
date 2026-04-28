const axios = require('axios');

module.exports = async (req, res) => {
  // 1. 设置查询参数
  const address = "62 ARAB ROAD PADSTOW";
  const baseUrl = "https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Property_Stock_And_Sales/MapServer/find";
  
  try {
    // 第一步：先模糊匹配地址，确保拿到正确的图层对象
    const response = await axios.get(baseUrl, {
      params: {
        searchText: address,
        layers: '0',        // 对应的图层索引
        f: 'json',
        sr: '4326',
        contains: true,
        searchFields: 'PROP_ADDR' // 显式指定在地址字段搜索
      },
      timeout: 10000
    });

    const results = response.data.results;
    
    if (!results || results.length === 0) {
      // 如果搜不到，返回 0,0 并在后台打日志
      console.log("Address not found in gov database");
      return res.status(200).send("0,0");
    }

    // 第二步：从结果中提取数据
    // 政府 API 返回的字段名可能在不同年份有细微差别，我们做兼容处理
    const attr = results[0].attributes;
    
    // 土地评估价字段 (Land Value)
    const landValue = attr.LAND_VALUE || attr.VALUATION_AMOUNT || attr.VALN_AMT || "0";
    
    // 物业 ID 或 上次交易价
    const extraInfo = attr.PROPERTY_ID || attr.PROP_ID || attr.LAST_SALE_PRICE || "0";

    // 设置返回头
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    
    // 最终输出：土地价值,辅助信息
    res.status(200).send(`${landValue},${extraInfo}`);

  } catch (error) {
    console.error("API Error:", error.message);
    res.status(200).send("error,0");
  }
};
