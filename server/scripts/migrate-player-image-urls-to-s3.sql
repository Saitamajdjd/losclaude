-- Upload the existing files to the bucket first, using the same keys:
-- uploads/players/<filename>
--
-- Then replace this value with your public S3 base URL, without a trailing slash.
-- Examples:
-- SET @s3_public_base_url = 'https://BUCKET.s3.REGION.amazonaws.com';
-- SET @s3_public_base_url = 'https://cdn.example.com/media';

SET @s3_public_base_url = 'https://BUCKET.s3.REGION.amazonaws.com';

START TRANSACTION;

SELECT
  id,
  image_url AS old_image_url,
  CONCAT(TRIM(TRAILING '/' FROM @s3_public_base_url), image_url) AS new_image_url
FROM players
WHERE image_url LIKE '/uploads/players/%';

UPDATE players
SET image_url = CONCAT(TRIM(TRAILING '/' FROM @s3_public_base_url), image_url)
WHERE image_url LIKE '/uploads/players/%';

COMMIT;
