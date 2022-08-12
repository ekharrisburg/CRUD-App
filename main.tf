provider "aws" {
    access_key = "${var.aws_access_key}"
    secret_key = "${var.aws_secret_key}"
    region = "${var.region}"
}

module "s3" {
    source = "./S3"
    #bucket name should be unique
    bucket_name = "ekhateeb-crud-bucket"       
}