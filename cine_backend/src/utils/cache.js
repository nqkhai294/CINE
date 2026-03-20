const NodeCache = require("node-cache");

/**
 * Khởi tạo Cache
 * - stdTTL: 3600 giây (1 tiếng) - Thời gian sống mặc định của mỗi key.
 * - checkperiod: 600 giây (10 phút) - Chu kỳ kiểm tra để xóa các key hết hạn.
 */
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

module.exports = cache;
