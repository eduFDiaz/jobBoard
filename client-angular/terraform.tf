provider "aws" {
  region = "us-west-1"
}

resource "aws_s3_bucket" "angular_app_bucket" {
    # bucket will be ignored so a random id is generated
    # EX: terraform-20240829064801797700000001
}

resource "aws_s3_bucket_website_configuration" "angular_app_bucket_website" {
  bucket = aws_s3_bucket.angular_app_bucket.id
  
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_versioning" "bucket_versioning" {
  bucket = aws_s3_bucket.angular_app_bucket.id
  versioning_configuration {
    status = "Disabled"
  }
}

resource "aws_s3_bucket_ownership_controls" "example" {
  bucket = aws_s3_bucket.angular_app_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "example" {
  bucket = aws_s3_bucket.angular_app_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "allow_access_from_internet" {
  version = "2012-10-17"
  statement {
    sid = "Stmt1724907217157"
    effect = "Allow"
    principals {
        type = "*"
        identifiers = ["*"]
    }
    actions = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.angular_app_bucket.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "allow_access_from_internet" {
  bucket = aws_s3_bucket.angular_app_bucket.id
  policy = data.aws_iam_policy_document.allow_access_from_internet.json
  depends_on = [ data.aws_iam_policy_document.allow_access_from_internet ]
}

resource "aws_s3_object" "angular_app_files" {
  bucket = aws_s3_bucket.angular_app_bucket.bucket
  for_each = fileset("${path.module}/dist/browser", "**")
  key    = each.value
  source = "${path.module}/dist/browser/${each.value}"
  etag   = filemd5("${path.module}/dist/browser/${each.value}")
  content_type = lookup({
    "html" = "text/html",
    "css"  = "text/css",
    "js"   = "application/javascript",
    "png"  = "image/png",
    "jpg"  = "image/jpeg",
    "jpeg" = "image/jpeg",
    "gif"  = "image/gif",
    "svg"  = "image/svg+xml",
    "ico"  = "image/x-icon"
  }, split(".", each.value)[length(split(".", each.value)) - 1], "application/octet-stream")
}

output "website_endpoint" {
  value = "http://${aws_s3_bucket.angular_app_bucket.website_endpoint}"
}

output "website_domain_name" {
  value = "http://${aws_s3_bucket.angular_app_bucket.bucket_domain_name}"
}

locals {
  s3_origin_id = "myS3Origin"
}

# CloudFront Distribution

resource "aws_cloudfront_origin_access_control" "default" {
  name = "example-origin-access-control"

  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "angular_app_distribution" {
   depends_on = [
    aws_cloudfront_origin_access_control.default,
    aws_s3_bucket.angular_app_bucket,
    aws_s3_object.angular_app_files
  ]

  origin {
    domain_name              = aws_s3_bucket.angular_app_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.default.id
    origin_id                = aws_s3_bucket.angular_app_bucket.website_endpoint
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = aws_s3_bucket.angular_app_bucket.website_endpoint

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "Angular App Distribution"
  }
}

output "cloudfront_domain_name" {
  value = "https://${aws_cloudfront_distribution.angular_app_distribution.domain_name}"
}