<template>
    <div class="">
        <input type="file" name="" value="" @change="fileChange($event)">
    </div>
</template>

<script>
import AWS from 'aws-sdk';
export default {
    data () {
        return {}
    },
    mounted () {
        // AWS.config.update({
        //     accessKeyId: "AKIAJGB2NRFWVEBCSTIA",
        //     secretAccessKey: "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"
        // });
        //
        // let s3 = new AWS.S3({
        //
        //     params: {
        //         Bucket: 'anis3',
        //         Region: 'us-east-1'
        //     }
        // });
        //
        // s3.listObjects(function (err, data) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log(data);
        //     }
        // });

        this.$s3.config({
            accessKeyId: "AKIAJGB2NRFWVEBCSTIA",
            secretAccessKey: "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"
        }, {
            params: {
                Bucket: 'anis3',
                Region: 'ap-northeast-1'
            }
        });

        // this.$s3.request.on('success', function (response) {
        //     console.log('EC2: ', response);
        // }).send();
        //
        // this.$s3.listObjects().then(data => {
        //     console.log(data);
        // }).catch(err => {
        //     console.log(err);
        // });
        //
        this.$s3.getObject("0.gif").then(data => {
            console.log(data);
        }).catch(err => {
            console.log(err);
        })
    },
    methods: {
        fileChange (e) {
            // AWS.config.update({
            //     accessKeyId: "AKIAJGB2NRFWVEBCSTIA",
            //     secretAccessKey: "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"
            // });
            //
            // let s3 = new AWS.S3();
            // console.log(s3)
            //
            // let fr = new FileReader();
            //
            // fr.onloadend = function () {
            //     s3.upload({
            //         Bucket: 'anis3',
            //         Key: 'del2.gif',
            //         Body: fr.result
            //       },function (resp) {
            //         console.log(arguments);
            //         console.log('Successfully uploaded package.');
            //       })
            // };
            // fr.readAsDataURL(e.target.files[0]);

            this.$s3.upload(e.target.files[0], {
                filename: e.target.files[0].name
            }).then(data => {
                console.log(data);
            }).catch(err => {
                console.log(err);
            })
        }
    }
}
</script>

<style lang="scss">
</style>
