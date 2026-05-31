const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MartHub API',
      version: '1.0.0',
      description: 'API documentation cho nền tảng thương mại điện tử MartHub',
    },
    servers: [{ url: 'http://localhost:5000', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Xác thực người dùng' },
      { name: 'Products', description: 'Sản phẩm' },
      { name: 'Cart', description: 'Giỏ hàng' },
      { name: 'Orders', description: 'Đơn hàng' },
      { name: 'Users', description: 'Người dùng' },
      { name: 'Sellers', description: 'Người bán' },
      { name: 'Admin', description: 'Quản trị' },
      { name: 'Reviews', description: 'Đánh giá' },
      { name: 'Favorites', description: 'Yêu thích' },
      { name: 'Chat', description: 'Tin nhắn' },
      { name: 'Notifications', description: 'Thông báo' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
