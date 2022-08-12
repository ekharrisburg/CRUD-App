resource "aws_s3_bucket" "crud-app" {
    bucket = "${var.bucket_name}" 
    acl = "${var.acl_value}"   
}