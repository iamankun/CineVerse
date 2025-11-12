<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
  xmlns:html="http://www.w3.org/1999/xhtml"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Sitemap XML - CineVerse</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            padding: 20px;
            line-height: 1.6;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
          }
          
          .header p {
            font-size: 1.1em;
            opacity: 0.95;
          }
          
          .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
          }
          
          .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
          }
          
          .stat-label {
            color: #6c757d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info {
            padding: 30px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            margin: 20px 30px;
            border-radius: 4px;
          }
          
          .info h2 {
            color: #856404;
            margin-bottom: 10px;
            font-size: 1.3em;
          }
          
          .info p {
            color: #856404;
            line-height: 1.8;
          }
          
          .url-list {
            padding: 30px;
          }
          
          .url-list h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.5em;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
          }
          
          thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.5px;
          }
          
          td {
            padding: 12px 15px;
            border-bottom: 1px solid #e9ecef;
          }
          
          tbody tr:hover {
            background: #f8f9fa;
          }
          
          .url-cell {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            word-break: break-all;
          }
          
          .url-cell:hover {
            text-decoration: underline;
          }
          
          .priority-high {
            color: #28a745;
            font-weight: bold;
          }
          
          .priority-medium {
            color: #ffc107;
            font-weight: bold;
          }
          
          .priority-low {
            color: #6c757d;
            font-weight: bold;
          }
          
          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75em;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .badge-daily {
            background: #d1ecf1;
            color: #0c5460;
          }
          
          .badge-weekly {
            background: #d4edda;
            color: #155724;
          }
          
          .badge-monthly {
            background: #fff3cd;
            color: #856404;
          }
          
          .footer {
            padding: 30px;
            text-align: center;
            background: #f8f9fa;
            color: #6c757d;
            border-top: 2px solid #e9ecef;
          }
          
          .footer a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
          }
          
          .footer a:hover {
            text-decoration: underline;
          }
          
          @media (max-width: 768px) {
            .header h1 {
              font-size: 1.8em;
            }
            
            table {
              font-size: 0.9em;
            }
            
            th, td {
              padding: 8px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🗺️ Sitemap XML</h1>
            <p>Bản đồ trang web CineVerse - Xem phim online chất lượng cao</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-number">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
              </div>
              <div class="stat-label">Tổng số trang</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:priority &gt;= 0.8])"/>
              </div>
              <div class="stat-label">Trang ưu tiên cao</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:changefreq='daily'])"/>
              </div>
              <div class="stat-label">Cập nhật hàng ngày</div>
            </div>
          </div>
          
          <div class="info">
            <h2>📋 Thông tin Sitemap</h2>
            <p>
              Đây là sitemap XML được tạo tự động cho website CineVerse. 
              Sitemap giúp các công cụ tìm kiếm như Google, Bing hiểu cấu trúc 
              website và crawl nội dung hiệu quả hơn. Tất cả các URL trong danh sách 
              dưới đây đều có thể truy cập công khai.
            </p>
          </div>
          
          <div class="url-list">
            <h2>📑 Danh sách URL</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 50%">URL</th>
                  <th>Ưu tiên</th>
                  <th>Tần suất</th>
                  <th>Cập nhật lần cuối</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <xsl:sort select="sitemap:priority" order="descending"/>
                  <tr>
                    <td>
                      <a class="url-cell" href="{sitemap:loc}">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="sitemap:priority &gt;= 0.8">
                          <span class="priority-high">
                            <xsl:value-of select="sitemap:priority"/>
                          </span>
                        </xsl:when>
                        <xsl:when test="sitemap:priority &gt;= 0.5">
                          <span class="priority-medium">
                            <xsl:value-of select="sitemap:priority"/>
                          </span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="priority-low">
                            <xsl:value-of select="sitemap:priority"/>
                          </span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="sitemap:changefreq='daily'">
                          <span class="badge badge-daily">Hàng ngày</span>
                        </xsl:when>
                        <xsl:when test="sitemap:changefreq='weekly'">
                          <span class="badge badge-weekly">Hàng tuần</span>
                        </xsl:when>
                        <xsl:when test="sitemap:changefreq='monthly'">
                          <span class="badge badge-monthly">Hàng tháng</span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="badge">
                            <xsl:value-of select="sitemap:changefreq"/>
                          </span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                    <td>
                      <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>
              Được tạo tự động bởi <a href="https://cineverse.ankun.dev">CineVerse</a>
              • Dữ liệu từ <a href="https://www.themoviedb.org">TMDB</a>
              • Cập nhật: <xsl:value-of select="substring(sitemap:urlset/sitemap:url[1]/sitemap:lastmod, 1, 10)"/>
            </p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
