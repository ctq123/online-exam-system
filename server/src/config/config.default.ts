import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1726399281021_3112',
  koa: {
    port: 7001,
  },
  upload: {
    mode: 'file',
    fileSize: '100mb', // 上传大小限制
    whitelist: [
      '.webm', // WebM 视频
      '.mp4', // MP4 视频
      '.avi', // AVI 视频
      '.mov', // MOV 视频
      '.mkv', // MKV 视频
      '.mp3', // MP3 音频
      '.wav', // WAV 音频
      '.png', // PNG 图片
      '.jpg',
      '.jpeg', // JPEG 图片
      '.gif', // GIF 图片
      '.doc',
      '.docx', // Word 文档
      '.pdf', // PDF 文档
      '.txt', // 文本文件
      '.xls',
      '.xlsx', // Excel 文档
      '.pptx', // PowerPoint 文档
      '.zip', // 压缩文件
      // 添加其他需要支持的文件类型
    ],
    tmpdir: join(__dirname, '../upload'), // 上传临时目录
    cleanTimeout: 300000, // 清理超时
  },
  cors: {
    origin: 'http://localhost:5173', // 只允许这个地址访问
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  },
} as MidwayConfig;
