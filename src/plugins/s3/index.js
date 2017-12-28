import S3Service from './s3Service';

export default function install (Vue) {
    Vue.prototype.$s3 = new S3Service();
}
