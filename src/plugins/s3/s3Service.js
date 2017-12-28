import AWS from 'aws-sdk';

export default class S3Service {
    constructor () {
        this.s3 = null;
        this.request = null;
    }

    config (auth, config) {
        AWS.config.update({
            accessKeyId: auth.accessKeyId,
            secretAccessKey: auth.secretAccessKey
        });

        this.s3 = new AWS.S3({
            ...config,
            apiVersion: '2006-03-01'
        });

        this.request = new AWS.EC2({ apiVersion: '2014-10-01' }).describeInstances();
    }

    upload (file, config, progress) {
        return new Promise((rs, rj) => {
            this.s3.upload({
                Key: config.filename,
                Body: file
            }, function (err, data) {
                if (err) rj(err);
                rs(data);
            }).on('httpUploadProgress', function (pr) {
                if (progress && typeof progress === 'function') {
                    progress.call(null, pr);
                }
            });
        });
    }

    getObject (key, bucket, progress) {
        return new Promise((rs, rj) => {
            this.s3.getObject(bucket ? Object.assign({}, { Key: key }, { Bucket: bucket }) : { Key: key }, function (err, data) {
                if (err) rj(err);
                rs(data);
            }).on('httpDownloadProgress', function (pr) {
                if (progress && typeof progress === 'function') {
                    progress.call(null, pr);
                }
            });
        });
    }

    deleteObject (key, bucket) {
        return new Promise((rs, rj) => {
            this.s3.deleteObject(bucket ? Object.assign({}, { Key: key }, { Bucket: bucket }) : { Key: key }, function (err, data) {
                if (err) rj(err);
                rs(data);
            });
        });
    }

    listObjects () {
        return new Promise((rs, rj) => {
            this.s3.listObjects((err, data) => {
                if (err) rj(err);
                rs(data);
            });
        });
    }

    destroyed () {
        this.s3 = null;
        this.request = null;
    }
}
