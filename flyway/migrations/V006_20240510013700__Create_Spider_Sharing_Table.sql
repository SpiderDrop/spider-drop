CREATE TABLE [shared_spiders] (
  [shared_spider_id] int IDENTITY(1,1) PRIMARY KEY,
  [spider_key] NVARCHAR(1024) NOT NULL,
  [shared_with] VARCHAR(256) NOT NULL,
  [revoked_at] DATETIME,
)
